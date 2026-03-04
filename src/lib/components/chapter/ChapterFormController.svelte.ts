import type { ChapterPage } from '$lib/api/endpoints/chapter';
import { resolveObjectUrl } from '$lib/cdn';
import {
	type ReactiveUploadHandle,
	type ReactiveUploadScheduler
} from '$lib/upload/reactive.svelte';
import { untrack } from 'svelte';

export class Page {
	readonly id: string;
	readonly url: string;

	objectName = $state<string | undefined>(undefined);
	upload = $state<ReactiveUploadHandle | undefined>(undefined);

	constructor(id: string, url: string) {
		this.id = id;
		this.url = url;
	}

	static fromFile(id: string, file: File): Page {
		return new Page(id, URL.createObjectURL(file));
	}

	static fromChapterPage(page: ChapterPage): Page {
		const p = new Page(page.object_name, resolveObjectUrl(page.object_name));
		p.objectName = page.object_name;
		return p;
	}

	revokeBlobUrl() {
		if (this.url.startsWith('blob:')) {
			URL.revokeObjectURL(this.url);
		}
	}
}

export type ChapterFormInitialValues = {
	volume?: string;
	number: string;
	title?: string;
	pages?: ChapterPage[];
};

export class ChapterFormController {
	volume = $state('');
	number = $state('');
	title = $state('');
	pages = $state<Page[]>([]);

	readonly allUploaded = $derived(!this.pages.some((p) => !p.objectName));

	readonly canSubmit = $derived(
		// must have number
		!!this.number.trim() &&
			// must have at least 1 page
			this.pages.length > 0 &&
			// all pages must be uploaded
			this.allUploaded
	);

	readonly #uploader: ReactiveUploadScheduler;

	constructor({
		uploader,
		initialValues
	}: {
		uploader: ReactiveUploadScheduler;
		initialValues?: ChapterFormInitialValues;
	}) {
		this.#uploader = uploader;

		untrack(() => {
			this.volume = initialValues?.volume ?? '';
			this.number = initialValues?.number ?? '';
			this.title = initialValues?.title ?? '';
			this.pages = (initialValues?.pages ?? []).map(Page.fromChapterPage);
		});
	}

	addFiles(files: File[]) {
		const now = Date.now().toString();
		const newPages = files
			.filter((file) => file.type.startsWith('image/'))
			.map((file, i) => {
				const page = Page.fromFile(`${now}-${i}`, file);
				this.#schedulePageUpload(page, file);
				return page;
			});
		this.pages = this.pages.concat(newPages);
		this.#uploader.start();
	}

	#schedulePageUpload(page: Page, file: File) {
		page.objectName = undefined;
		page.upload = this.#uploader.schedule(file, {
			onComplete: (objectName) => {
				page.objectName = objectName;
			}
		});
	}

	reorderPage(fromIndex: number, toIndex: number) {
		if (
			fromIndex < 0 ||
			fromIndex >= this.pages.length ||
			toIndex < 0 ||
			toIndex >= this.pages.length
		) {
			return;
		}
		const pages = [...this.pages];
		const [movedPage] = pages.splice(fromIndex, 1);
		pages.splice(toIndex, 0, movedPage);
		this.pages = pages;
	}

	removePage(page: Page) {
		const i = this.pages.indexOf(page);
		if (i === -1) return;
		this.pages.splice(i, 1);
		page.revokeBlobUrl();
	}

	retryUploadPage(page: Page) {
		if (!page.upload) return;
		this.#schedulePageUpload(page, page.upload.file);
		this.#uploader.start();
	}

	values() {
		return {
			volume: this.volume.trim(),
			number: this.number.trim(),
			title: this.title.trim(),
			pages: this.pages.map((p) => p.objectName!).filter((n): n is string => !!n)
		};
	}

	destroy() {
		this.#uploader.stop();
		this.pages.forEach((page) => page.revokeBlobUrl());
	}
}
