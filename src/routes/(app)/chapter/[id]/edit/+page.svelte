<script lang="ts">
	import { updateChapter } from '$lib/api/endpoints/chapter';
	import { buildFetcher } from '$lib/auth/fetcher';
	import ChapterForm from '$lib/components/chapter/ChapterForm.svelte';
	import { ChapterFormController } from '$lib/components/chapter/ChapterFormController.svelte';
	import { apiBase } from '$lib/config';
	import { ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
	import { UploadScheduler, UploadBatcher } from '$lib/upload/scheduler';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';
	import ImagePreviewDialog from '$lib/components/image/ImagePreviewDialog.svelte';

	let { data }: PageProps = $props();

	const fetcher = $derived(buildFetcher(fetch));

	const uploader = new ReactiveUploadScheduler(
		new UploadScheduler({
			batcher: new UploadBatcher(3),
			apiBase,
			fetcherFactory: () => fetcher
		})
	);

	const controller = new ChapterFormController({
		uploader,
		initialValues: untrack(() => data.chapter)
	});

	let loading = $state(false);
	async function handleSubmit() {
		if (!controller.canSubmit) return;
		try {
			loading = true;
			await updateChapter(apiBase, fetcher, data.chapter.id, {
				manga_id: data.chapter.manga_id,
				...controller.values()
			});
			invalidate(`chapter:${data.chapter.id}`);
		} finally {
			loading = false;
		}
	}

	let previewImageUrl = $state<string | null>(null);
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<div class="flex-1">
			<h1 class="text-lg leading-tight font-bold">Edit Chapter</h1>
			<p class="line-clamp-1 text-xs text-base-content/50"></p>
		</div>
	</div>
</div>

<div class="container mx-auto">
	<ChapterForm {controller} onPreviewPage={(url) => (previewImageUrl = url)} />

	<div class="divider"></div>

	<div class="sticky bottom-0 bg-base-100 py-2">
		<div class="flex justify-end gap-2 px-4">
			<button class="btn" disabled={true}> Preview </button>
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Save</button
			>
		</div>
	</div>
</div>

<ImagePreviewDialog bind:imageUrl={previewImageUrl} />
