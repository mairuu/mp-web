import { uploadFiles, type UploadAcceptance } from '$lib/api/endpoints/upload';
import type { Fetch } from '$lib/api/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'rejected' | 'cancelled';

/** Per-item hooks supplied at schedule time. */
export type UploadItemHooks = {
	/** Item accepted by the server. */
	onComplete?: (objectName: string) => void;
	/** Item rejected by the server, or network/abort error. */
	onReject?: (reason: string) => void;
	/** cancel() called while item is still pending. */
	onCancel?: () => void;
};

/** Scheduler-wide hooks supplied at construction time. */
export type UploadSchedulerHooks = {
	/** Fired synchronously when schedule() is called. */
	onEnqueue?: (handle: UploadHandle) => void;
	/** Fired just before the HTTP request for a batch begins. */
	onBatchStart?: (handles: UploadHandle[]) => void;
	/** Fired after a batch request settles (success or error). */
	onBatchComplete?: (handles: UploadHandle[]) => void;
	/** Fired when the queue drains to empty. */
	onDrain?: () => void;
};

/** Handle returned per scheduled file. */
export type UploadHandle = {
	readonly file: File;
	/** Current lifecycle status. Mutated by the scheduler. */
	status: UploadStatus;
	/** Resolves when the batch this item belongs to settles.
	 *  Always resolves — never rejects. Check `status` for the outcome. */
	readonly promise: Promise<void>;
	/** Cancel before uploading starts. No-op once uploading. */
	cancel(): void;
};

export type BatchEntry = {
	refId: string;
	handle: UploadHandle;
	hooks: UploadItemHooks;
	resolve: () => void;
};

/**
 * size-based batcher. Collects entries until `batchSize` is reached, then flushes
 */
export class UploadBatcher {
	#pending: BatchEntry[] = [];
	#batchSize: number;

	constructor(batchSize = 3) {
		this.#batchSize = batchSize;
	}

	get pendingCount() {
		return this.#pending.length;
	}

	/** add an entry; auto-flushes when full. */
	add(entry: BatchEntry): BatchEntry[] | null {
		this.#pending.push(entry);
		if (this.#pending.length >= this.#batchSize) {
			return this.flush();
		}
		return null;
	}

	/** Take up to `batchSize` entries. */
	flush(): BatchEntry[] {
		return this.#pending.splice(0, this.#batchSize);
	}

	/** Drain everything as multiple batches. */
	flushAll(): BatchEntry[][] {
		const batches: BatchEntry[][] = [];
		while (this.#pending.length > 0) {
			batches.push(this.flush());
		}
		return batches;
	}

	/** Remove a specific entry (for pre-flight cancel). */
	remove(handle: UploadHandle): BatchEntry | undefined {
		const idx = this.#pending.findIndex((e) => e.handle === handle);
		if (idx === -1) return undefined;
		const [entry] = this.#pending.splice(idx, 1);
		return entry;
	}
}

// ─── UploadQueue ───────────────────────────────────────────────────────────────

type Job = () => Promise<void>;

type QueuedBatch = {
	job: Job;
	entries: BatchEntry[];
};

/**
 * Generic sequential job runner.
 * Processes one job at a time; self-ticks on enqueue.
 */
export class UploadQueue {
	#batches: QueuedBatch[] = [];
	#running = false;
	#onDrain?: () => void;

	constructor(options?: { onDrain?: () => void }) {
		this.#onDrain = options?.onDrain;
	}

	get size() {
		return this.#batches.length;
	}

	enqueue(job: Job, entries: BatchEntry[]) {
		this.#batches.push({ job, entries });
		this.#tick();
	}

	/**
	 * Discard all pending (not yet started) batches.
	 * Returns their entries so the caller can cancel/resolve them.
	 */
	clear(): BatchEntry[] {
		const abandoned = this.#batches.flatMap((b) => b.entries);
		this.#batches = [];
		return abandoned;
	}

	#tick() {
		if (this.#running || this.#batches.length === 0) return;
		this.#running = true;
		const { job } = this.#batches.shift()!;
		job().finally(() => {
			this.#running = false;
			if (this.#batches.length > 0) {
				this.#tick();
			} else {
				this.#onDrain?.();
			}
		});
	}
}

// ─── UploadScheduler ───────────────────────────────────────────────────────────

export type UploadSchedulerOptions = {
	/** Batcher instance to use. Defaults to `new UploadBatcher()`. */
	batcher?: UploadBatcher;
	/** Queue instance to use. Defaults to a new `UploadQueue`. */
	queue?: UploadQueue;
	/** Scheduler-wide lifecycle hooks. */
	hooks?: UploadSchedulerHooks;
	/**
	 * Required: factory that returns the `fetch` implementation to use.
	 * Called once per batch — evaluated lazily so auth tokens are fresh.
	 *
	 * @example
	 * ```ts
	 * fetcherFactory: () => injectAccessToken(fetch, session.value?.token)
	 * ```
	 */
	fetcherFactory: () => Fetch;
	/** Base URL for the upload endpoint. */
	apiBase: string;
};

/**
 * Composes `UploadBatcher` + `UploadQueue` + HTTP upload.
 *
 * ```ts
 * const scheduler = new UploadScheduler({ batchSize: 2, fetcherFactory, apiBase });
 * const handle = scheduler.schedule(file, { onComplete: (name) => ... });
 * scheduler.start();
 * ```
 */
export class UploadScheduler {
	#batcher: UploadBatcher;
	#queue: UploadQueue;
	#hooks: UploadSchedulerHooks;
	#fetcherFactory: () => Fetch;
	#apiBase: string;
	#abortController: AbortController | null = null;

	constructor(options: UploadSchedulerOptions) {
		this.#hooks = options.hooks ?? {};
		this.#fetcherFactory = options.fetcherFactory;
		this.#apiBase = options.apiBase;

		this.#batcher = options.batcher ?? new UploadBatcher();
		this.#queue =
			options.queue ??
			new UploadQueue({
				onDrain: () => this.#hooks.onDrain?.()
			});
	}

	/**
	 * Replace the scheduler-wide hooks after construction.
	 * Useful when a decorator (e.g. ReactiveUploadScheduler) needs to intercept
	 * lifecycle events without being involved in batcher/queue/fetcher config.
	 */
	setHooks(hooks: UploadSchedulerHooks) {
		this.#hooks = hooks;
	}

	/**
	 * Schedule a file. Automatically enqueues a full batch.
	 * Call `start()` when done to flush any remaining partial batch.
	 */
	schedule(file: File, hooks: UploadItemHooks = {}): UploadHandle {
		let resolve!: () => void;
		const promise = new Promise<void>((res) => {
			resolve = res;
		});

		const handle: UploadHandle = {
			file,
			status: 'pending',
			promise,
			cancel: () => this.#cancel(handle, hooks)
		};

		this.#hooks.onEnqueue?.(handle);

		const refId = this.#nextRefId();
		const fullBatch = this.#batcher.add({ refId, handle, hooks, resolve });
		if (fullBatch) {
			this.#enqueueBatch(fullBatch);
		}

		return handle;
	}

	/**
	 * Flush any partial batch and begin processing.
	 * Idempotent — safe to call multiple times.
	 */
	start() {
		this.#abortController ??= new AbortController();
		for (const batch of this.#batcher.flushAll()) {
			this.#enqueueBatch(batch);
		}
	}

	/** Abort in-flight requests and discard queued jobs. */
	stop() {
		this.#abortController?.abort();
		this.#abortController = null;

		const queuedEntries = this.#queue.clear();
		const batcherEntries = this.#batcher.flushAll().flat();

		for (const entry of [...queuedEntries, ...batcherEntries]) {
			entry.handle.status = 'cancelled';
			entry.hooks.onCancel?.();
			entry.resolve();
		}
	}

	#cancel(handle: UploadHandle, hooks: UploadItemHooks) {
		if (handle.status !== 'pending') return;
		const entry = this.#batcher.remove(handle);
		if (entry) {
			handle.status = 'cancelled';
			hooks.onCancel?.();
			entry.resolve();
		}
	}

	#enqueueBatch(batch: BatchEntry[]) {
		// Capture signal at enqueue time; refreshed on each start() call.
		const signal = this.#abortController?.signal;

		const job = async () => {
			const handles = batch.map((e) => e.handle);
			this.#hooks.onBatchStart?.(handles);

			for (const entry of batch) {
				if (entry.handle.status !== 'cancelled') {
					entry.handle.status = 'uploading';
				}
			}

			const active = batch.filter((e) => e.handle.status === 'uploading');

			let result: UploadAcceptance;
			try {
				result = await uploadFiles(
					this.#apiBase,
					this.#fetcherFactory(),
					active.map((e) => e.handle.file),
					active.map((e) => e.refId),
					signal
				);
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				for (const entry of active) {
					entry.handle.status = 'rejected';
					entry.hooks.onReject?.(reason);
					entry.resolve();
				}
				this.#hooks.onBatchComplete?.(handles);
				return;
			}

			const byID = new Map(active.map((e) => [e.refId, e]));

			for (const accept of result.accepts) {
				const entry = byID.get(accept.ref_id ?? accept.original_filename);
				if (!entry) continue;
				entry.handle.status = 'done';
				entry.hooks.onComplete?.(accept.object_name);
				entry.resolve();
			}

			for (const reject of result.rejects) {
				const entry = byID.get(reject.ref_id ?? reject.original_filename);
				if (!entry) continue;
				entry.handle.status = 'rejected';
				entry.hooks.onReject?.(reject.reason);
				entry.resolve();
			}

			this.#hooks.onBatchComplete?.(handles);
		};

		this.#queue.enqueue(job, batch);
	}

	#refCounter = 0;
	#nextRefId() {
		return (this.#refCounter++).toString();
	}
}
