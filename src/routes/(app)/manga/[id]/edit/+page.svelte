<script lang="ts">
	import { buildFetcher } from '$lib/auth/fetcher';
	import { updateManga } from '$lib/api/endpoints/manga';
	import { apiBase } from '$lib/config';
	import { ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
	import { UploadBatcher, UploadScheduler } from '$lib/upload/scheduler';
	import { untrack } from 'svelte';
	import MangaForm from '$lib/components/manga/MangaForm.svelte';
	import { MangaFormController } from '$lib/components/manga/MangaFormController.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';
	import ImagePreviewDialog from '$lib/components/image/ImagePreviewDialog.svelte';

	const { data }: PageProps = $props();

	const fetcher = $derived(buildFetcher(fetch));

	const controller = new MangaFormController({
		uploader: new ReactiveUploadScheduler(
			new UploadScheduler({
				batcher: new UploadBatcher(3),
				apiBase,
				fetcherFactory: () => fetcher
			})
		),
		initialValues: untrack(() => data.manga)
	});

	let loading = $state(false);
	async function handleSubmit() {
		if (!controller.canSubmit) return;

		try {
			loading = true;
			await updateManga(apiBase, fetcher, data.manga.id, controller.values());
			invalidate(`manga:${data.manga.id}`);
		} finally {
			loading = false;
		}
	}

	let imagePreviewUrl = $state<string | null>(null);
</script>

<div class="h-24"></div>

<div class="container mx-auto min-h-screen">
	<h1 class="px-4 text-xl font-bold">
		Edit Manga (<span class="italic">{data.manga.title}</span>)
	</h1>

	<MangaForm {controller} onPreviewImage={(url) => (imagePreviewUrl = url)} />

	<div class="divider"></div>

	<div class="sticky bottom-0 bg-base-100 px-4 py-2">
		<div class="flex justify-end gap-2">
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Save</button
			>
		</div>
	</div>
</div>

<ImagePreviewDialog bind:imageUrl={imagePreviewUrl} />
