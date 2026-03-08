<script lang="ts">
	import { createManga } from '$lib/api/endpoints/manga';
	import { buildFetcher } from '$lib/auth/fetcher';
	import { apiBase } from '$lib/config';
	import { ReactiveUploadScheduler } from '$lib/upload/reactive.svelte';
	import { UploadBatcher, UploadScheduler } from '$lib/upload/scheduler';
	import MangaForm from '$lib/components/manga/MangaForm.svelte';
	import { MangaFormController } from '$lib/components/manga/MangaFormController.svelte';

	const fetcher = $derived(buildFetcher(fetch));

	const uploader = new ReactiveUploadScheduler(
		new UploadScheduler({
			batcher: new UploadBatcher(3),
			apiBase,
			fetcherFactory: () => fetcher
		})
	);
	const controller = new MangaFormController({ uploader });

	let loading = $state(false);
	async function handleSubmit() {
		if (!controller.canSubmit) return;
		try {
			loading = true;
			await createManga(apiBase, fetcher, controller.values());
		} finally {
			loading = false;
		}
	}
</script>

<div class="h-4"></div>

<div class="container mx-auto min-h-screen">
	<h1 class="px-4 text-xl font-bold">Create Manga</h1>

	<MangaForm {controller} />

	<div class="divider"></div>

	<div class="bg-base-100 px-4 py-2">
		<div class="flex justify-end gap-2">
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Create</button
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
		</ul>

		<div class="mt-4 font-bold">Cover File Limitations</div>

		<ul class="list-disc pl-6">
			<li>Accepted formats: WebP, JPEG, PNG.</li>
			<li>Maximum size: 5MB per image.</li>
			<li>Portrait orientation is preferred.</li>
		</ul>
	</div>
</div>
