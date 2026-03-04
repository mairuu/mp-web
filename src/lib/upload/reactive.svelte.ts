import {
	UploadScheduler,
	type UploadHandle,
	type UploadItemHooks,
	type UploadStatus
} from './scheduler';
import { SvelteMap } from 'svelte/reactivity';

// ─── Reactive handle ───────────────────────────────────────────────────────────

/**
 * A reactive wrapper around `UploadHandle`.
 * `status` is a Svelte `$state` rune — reads are tracked, writes trigger updates.
 */
export type ReactiveUploadHandle = Omit<UploadHandle, 'status'> & {
	get status(): UploadStatus;
};

class ReactiveHandle implements ReactiveUploadHandle {
	readonly file: File;
	readonly promise: Promise<void>;

	// Svelte $state — the only reactive field.
	status: UploadStatus = $state('pending');

	/** The raw scheduler handle, kept for cancel delegation. */
	#inner: UploadHandle;

	constructor(inner: UploadHandle) {
		this.#inner = inner;
		this.file = inner.file;
		this.promise = inner.promise;
	}

	cancel() {
		this.#inner.cancel();
	}
}

// ─── Per-item hooks for the reactive adapter ───────────────────────────────────

export type ReactiveUploadItemHooks = {
	/** Item accepted by the server — objectName is the stored key. */
	onComplete?: (objectName: string) => void;
	/** Item rejected by the server or errored. */
	onReject?: (reason: string) => void;
	/** cancel() called while item is still pending. */
	onCancel?: () => void;
};

// ─── Scheduler-wide hooks for the reactive adapter ────────────────────────────

export type ReactiveUploadSchedulerHooks = {
	/** Fired when a file is added to the queue (status → pending). */
	onEnqueue?: (handle: ReactiveUploadHandle) => void;
	/** Fired when a file's HTTP upload begins (status → uploading). */
	onUpload?: (handle: ReactiveUploadHandle) => void;
	/** Fired when a file is accepted by the server (status → done). */
	onComplete?: (handle: ReactiveUploadHandle, objectName: string) => void;
	/** Fired when a file is rejected or errored (status → rejected). */
	onReject?: (handle: ReactiveUploadHandle, reason: string) => void;
	/** Fired when cancel() succeeds (status → cancelled). */
	onCancel?: (handle: ReactiveUploadHandle) => void;
	/** Fired when the queue drains to empty. */
	onDrain?: () => void;
};

// ─── ReactiveUploadScheduler ──────────────────────────────────────────────────

// ─── ReactiveUploadScheduler ──────────────────────────────────────────────────

/**
 * Svelte-aware decorator over `UploadScheduler`.
 *
 * Returns `ReactiveUploadHandle` objects whose `status` field is a `$state` rune —
 * changes automatically trigger template re-renders without any `{#await}` blocks.
 *
 * Takes a pre-built `UploadScheduler` so batcher, queue, fetcher and apiBase are
 * all configured independently before being handed in.
 *
 * ```svelte
 * <script lang="ts">
 *   import { UploadBatcher, UploadScheduler } from '$lib/upload/scheduler';
 *   import { ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
 *   import { injectAccessToken } from '$lib/api/api';
 *   import { session } from '$lib/auth/auth.svelte';
 *   import { apiBase } from '$lib/config';
 *
 *   const scheduler = new ReactiveUploadScheduler(
 *     new UploadScheduler({
 *       batcher: new UploadBatcher(2),
 *       apiBase,
 *       fetcherFactory: () => injectAccessToken(fetch, session.value?.token),
 *     }),
 *     {
 *       onComplete: (handle, name) => console.log('uploaded', name),
 *       onDrain: () => console.log('all done'),
 *     }
 *   );
 * </script>
 * ```
 */
export class ReactiveUploadScheduler {
	#scheduler: UploadScheduler;
	#hooks: ReactiveUploadSchedulerHooks;
	#handles = new SvelteMap<UploadHandle, ReactiveHandle>();

	constructor(scheduler: UploadScheduler, hooks: ReactiveUploadSchedulerHooks = {}) {
		this.#hooks = hooks;
		this.#scheduler = scheduler;

		// Wire internal scheduler hooks into our reactive layer.
		scheduler.setHooks({
			onEnqueue: (inner) => {
				const rh = this.#handles.get(inner)!;
				this.#hooks.onEnqueue?.(rh);
			},
			onBatchStart: (inners) => {
				for (const inner of inners) {
					const rh = this.#handles.get(inner);
					if (rh && rh.status !== 'cancelled') {
						rh.status = 'uploading';
						this.#hooks.onUpload?.(rh);
					}
				}
			},
			onBatchComplete: (inners) => {
				for (const inner of inners) {
					this.#handles.delete(inner);
				}
			},
			onDrain: () => this.#hooks.onDrain?.()
		});
	}

	/**
	 * Schedule a file and get back a reactive handle.
	 * The `status` field updates automatically as the upload progresses.
	 */
	schedule(file: File, hooks: ReactiveUploadItemHooks = {}): ReactiveUploadHandle {
		// We build the inner hooks referencing `reactiveHandle` via a shared container
		// so the closure can reference the reactive wrapper before it's assigned.
		const ref: { handle?: ReactiveHandle } = {};

		const innerHooks: UploadItemHooks = {
			onComplete: (objectName) => {
				ref.handle!.status = 'done';
				hooks.onComplete?.(objectName);
				this.#hooks.onComplete?.(ref.handle!, objectName);
			},
			onReject: (reason) => {
				ref.handle!.status = 'rejected';
				hooks.onReject?.(reason);
				this.#hooks.onReject?.(ref.handle!, reason);
			},
			onCancel: () => {
				ref.handle!.status = 'cancelled';
				hooks.onCancel?.();
				this.#hooks.onCancel?.(ref.handle!);
			}
		};

		const inner = this.#scheduler.schedule(file, innerHooks);
		const reactiveHandle = new ReactiveHandle(inner);
		ref.handle = reactiveHandle;

		this.#handles.set(inner, reactiveHandle);

		return reactiveHandle;
	}

	/** Flush remaining partial batch and begin processing. */
	start() {
		this.#scheduler.start();
	}

	/** Abort in-flight requests and discard pending jobs. */
	stop() {
		this.#scheduler.stop();
	}
}
