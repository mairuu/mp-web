import { resolveThumbnailUrl } from '$lib/cdn';
import type { CoverArt, CreateMangaCover } from '$lib/api/endpoints/manga';
import type { ReactiveUploadHandle, ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
import { untrack } from 'svelte';

export class MangaCover {
	readonly id: string;
	readonly url: string;

	volume = $state<string | undefined>(undefined);
	isPrimary = $state(false);
	objectName = $state<string | undefined>(undefined);
	upload = $state<ReactiveUploadHandle | undefined>(undefined);

	constructor(id: string, url: string) {
		this.id = id;
		this.url = url;
	}

	static fromFile(id: string, file: File): MangaCover {
		return new MangaCover(id, URL.createObjectURL(file));
	}

	static fromCoverArt(c: CoverArt): MangaCover {
		const cover = new MangaCover(c.object_name, resolveThumbnailUrl(c.object_name));
		cover.volume = c.volume;
		cover.isPrimary = c.is_primary;
		cover.objectName = c.object_name;
		return cover;
	}

	revokeBlobUrl() {
		if (this.url.startsWith('blob:')) {
			URL.revokeObjectURL(this.url);
		}
	}

	toCreateCover(): CreateMangaCover {
		return {
			object_name: this.objectName!,
			is_primary: this.isPrimary,
			volume: this.volume
		};
	}
}

export type MangaFormInitialValues = {
	title?: string;
	synopsis?: string;
	status?: string;
	covers?: CoverArt[];
};

export class MangaFormController {
	title = $state('');
	synopsis = $state('');
	status = $state('');
	covers = $state<MangaCover[]>([]);

	readonly allUploaded = $derived(
		// !this.covers.some((c) => !!c.upload && c.upload.status !== 'done')
		!this.covers.some((c) => !c.objectName)
	);

	readonly canSubmit = $derived(
		// must have title
		!!this.title.trim() &&
			// must specify status
			!!this.status &&
			// all covers must be uploaded
			this.allUploaded
	);

	readonly #uploader: ReactiveUploadScheduler;

	constructor({
		uploader,
		initialValues
	}: {
		uploader: ReactiveUploadScheduler;
		initialValues?: MangaFormInitialValues;
	}) {
		this.#uploader = uploader;

		untrack(() => {
			this.title = initialValues?.title ?? '';
			this.synopsis = initialValues?.synopsis ?? '';
			this.status = initialValues?.status ?? '';
			this.covers = initialValues?.covers?.map(MangaCover.fromCoverArt) ?? [];
		});
	}

	addFiles(files: File[]) {
		const now = Date.now().toString();
		const newCovers = files
			.filter((f) => f.type.startsWith('image/'))
			.map((file, i) => {
				const cover = MangaCover.fromFile(`${now}-${i}`, file);
				this.#scheduleCoverUpload(cover, file);
				return cover;
			});

		this.covers.push(...newCovers);
		this.#uploader.start();
	}

	togglePrimary(cover: MangaCover) {
		for (const c of this.covers) {
			c.isPrimary = c === cover ? !c.isPrimary : false;
		}
	}

	retryUploadCover(cover: MangaCover) {
		this.#scheduleCoverUpload(cover, cover.upload!.file);
		this.#uploader.start();
	}

	removeCover(cover: MangaCover) {
		const i = this.covers.findIndex((c) => c === cover);
		if (i === -1) return;
		this.covers.splice(i, 1);
		cover.revokeBlobUrl();
	}

	destroy() {
		this.#uploader.stop();
		this.covers.forEach((c) => c.revokeBlobUrl());
		// todo: delete uploaded objects that were never submitted
	}

	values() {
		return {
			title: this.title.trim(),
			synopsis: this.synopsis.trim() || undefined,
			status: this.status,
			covers: this.covers.map((c) => c.toCreateCover())
		};
	}

	#scheduleCoverUpload(cover: MangaCover, file: File) {
		cover.objectName = undefined;
		cover.upload = this.#uploader.schedule(file, {
			onComplete: (objectName) => {
				cover.objectName = objectName;
			}
		});
	}
}
