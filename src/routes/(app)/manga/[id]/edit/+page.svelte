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

<div class="h-4"></div>

<div class="container mx-auto min-h-screen">
	<h1 class="px-4 text-xl font-bold">
		Edit Manga (<span class="italic">{data.manga.title}</span>)
	</h1>

	<MangaForm {controller} onPreviewImage={(url) => (imagePreviewUrl = url)} />

	<div class="divider"></div>

	<div class="bg-base-100 px-4 py-2">
		<div class="flex justify-end gap-2">
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Save</button
			>
		</div>
	</div>

	<div class="divider"></div>

	<div class="p-4">
		<h3 class="font-bold">Submission Guidelines</h3>

		<div class="mt-4 font-bold">General</div>

		<ul class="list-disc pl-6">
			<li>At least one cover image is required.</li>
			<li>If no primary cover is selected, the last volume cover will be used.</li>
			<li>Troll or spam submissions may result in revoked permissions.</li>
			<li>Click <strong>Save</strong> to save changes. Edits are not saved until submission.</li>
		</ul>

		<div class="mt-4 font-bold">Cover File Limitations</div>

		<ul class="list-disc pl-6">
			<li>Accepted formats: WebP, JPEG, PNG.</li>
			<li>Maximum size: 5MB per image.</li>
			<li>Portrait orientation is preferred.</li>
		</ul>
	</div>
</div>

<ImagePreviewDialog bind:imageUrl={imagePreviewUrl} />
