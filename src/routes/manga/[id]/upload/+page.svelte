<script lang="ts">
	import { createChapter } from '$lib/api/endpoints/chapter';
	import { buildFetcher } from '$lib/auth/fetcher';
	import ChapterForm from '$lib/components/chapter/ChapterForm.svelte';
	import { ChapterFormController } from '$lib/components/chapter/ChapterFormController.svelte';
	import { apiBase } from '$lib/config';
	import { ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
	import { UploadScheduler, UploadBatcher } from '$lib/upload/scheduler';
	import type { PageProps } from './$types';
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

	const controller = new ChapterFormController({ uploader });

	let loading = $state(false);
	async function handleSubmit() {
		if (!controller.canSubmit) return;
		try {
			loading = true;
			await createChapter(apiBase, fetcher, {
				manga_id: data.manga.id,
				...controller.values()
			});
		} finally {
			loading = false;
		}
	}

	let previewImageUrl = $state<string | null>(null);
</script>

<div class="h-24"></div>

<div class="container mx-auto">
	<h4 class="my-4 px-4 text-lg font-bold">Details</h4>

	<div class="my-4 flex gap-3 bg-base-200 p-4">
		<div class="w-24 shrink-0">
			<div class="relative flex w-full items-center justify-center" style:padding-bottom="140%">
				<div
					class="absolute inset-0 flex items-center justify-center rounded-box bg-cover bg-center"
					style:background-image="url({data.coverUrl})"
				></div>
			</div>
		</div>
		<div>
			<h2 class="font-bold">{data.manga.title}</h2>
			<span
				class="badge"
				class:badge-success={data.manga.status === 'ongoing'}
				class:badge-info={data.manga.status === 'completed'}
				class:badge-warning={data.manga.status === 'hiatus'}
				class:badge-neutral={data.manga.status === 'cancelled'}>{data.manga.status}</span
			>
		</div>
	</div>

	<ChapterForm {controller} onPreviewPage={(url) => (previewImageUrl = url)} />

	<div class="divider"></div>

	<div class="sticky bottom-0 bg-base-100 px-4 py-2">
		<div class="flex justify-end gap-2">
			<button class="btn" disabled={true}> Preview </button>
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Create</button
			>
		</div>
	</div>
</div>

<ImagePreviewDialog bind:imageUrl={previewImageUrl} />
