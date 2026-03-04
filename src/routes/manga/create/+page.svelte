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

<div class="h-24"></div>

<div class="container mx-auto min-h-screen">
	<h1 class="px-4 text-xl font-bold">Create Manga</h1>

	<MangaForm {controller} />

	<div class="divider"></div>

	<div class="sticky bottom-0 bg-base-100 px-4 py-2">
		<div class="flex justify-end gap-2">
			<button
				class="btn btn-primary"
				class:loading
				disabled={!controller.canSubmit}
				onclick={handleSubmit}>Create</button
			>
		</div>
	</div>
</div>
