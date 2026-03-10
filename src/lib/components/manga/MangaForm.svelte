<script lang="ts">
	import Select from '$lib/components/select/Select.svelte';

	import X from '@lucide/svelte/icons/x';
	import Book from '@lucide/svelte/icons/book';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';

	import { MangaCover, type MangaFormController } from './MangaFormController.svelte';
	import { onMount } from 'svelte';
	import { resolveObjectUrl } from '$lib/cdn';

	let {
		controller,
		onPreviewImage
	}: { controller: MangaFormController; onPreviewImage?: (url: string) => void } = $props();

	onMount(() => () => controller.destroy());

	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/webp, image/jpeg, image/png';
		input.multiple = true;
		input.onchange = () => {
			if (!input.files) return;
			controller.addFiles(Array.from(input.files));
		};
		input.click();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer?.files) return;
		controller.addFiles(Array.from(e.dataTransfer.files));
	}

	let dragover = $state(false);

	function previewCover(cover: MangaCover) {
		if (cover.upload) {
			onPreviewImage?.(cover.url);
		} else {
			onPreviewImage?.(resolveObjectUrl(cover.objectName)); // original file
		}
	}
</script>

<div class="px-4">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Title</legend>
		<input type="text" class="input w-full" placeholder="" bind:value={controller.title} />
	</fieldset>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Synopsis</legend>
		<textarea class="textarea w-full" placeholder="" bind:value={controller.synopsis}></textarea>
	</fieldset>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Publication Status</legend>
		<Select
			bind:value={controller.status}
			placeholder="Select publication status"
			options={[
				{ value: 'ongoing', label: 'Ongoing' },
				{ value: 'completed', label: 'Completed' },
				{ value: 'hiatus', label: 'Hiatus' },
				{ value: 'cancelled', label: 'Cancelled' }
			]}
		/>
	</fieldset>
</div>

<div class="divider"></div>

<div class="px-4">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Covers</legend>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each controller.covers as cover (cover.id)}
				<div class="">
					<div class="relative aspect-5/7 overflow-hidden rounded-box">
						<button class="cursor-pointer" onclick={() => previewCover(cover)}>
							<img
								class="absolute inset-0 h-full w-full object-cover"
								class:outline-2={cover.isPrimary}
								src={cover.url}
								alt=""
							/>
						</button>

						{#if cover.upload}
							<div
								class={{
									'absolute inset-0 flex items-center justify-center': true,
									'bg-black/30':
										cover.upload.status === 'pending' || cover.upload.status === 'uploading',
									'bg-error/30': cover.upload.status === 'rejected'
								}}
							>
								{#if cover.upload.status === 'pending'}
									<span class="loading loading-ring"></span>
								{:else if cover.upload.status === 'uploading'}
									<span class="loading loading-spinner"></span>
								{:else if cover.upload.status === 'rejected'}
									<button class="btn btn-circle" onclick={() => controller.retryUploadCover(cover)}>
										<RotateCw class="h-4 w-4" />
									</button>
								{/if}
							</div>
						{/if}

						<button
							class="btn absolute top-2 right-2 btn-circle btn-xs"
							onclick={() => controller.removeCover(cover)}
						>
							<X class="h-4 w-4" />
						</button>

						<span class="absolute bottom-2 left-2 badge">
							{cover.volume ? `Volume ${cover.volume}` : 'No volume'}
						</span>
					</div>

					<div class="mt-2 flex gap-2">
						<label class="label">
							<input
								type="checkbox"
								onchange={() => controller.togglePrimary(cover)}
								checked={cover.isPrimary}
								class="checkbox"
							/>
						</label>

						<label for="" class="input input-sm">
							<Book class="h-4 w-4" />
							<input type="text" bind:value={cover.volume} placeholder="Volume number" />
						</label>
					</div>
				</div>
			{/each}

			<button class="relative aspect-5/7" onclick={openFileDialog}>
				<label
					for=""
					class={{
						'absolute inset-0 flex cursor-pointer items-center justify-center rounded-box border-2 border-dashed border-base-content/10 hover:bg-base-200': true,
						'bg-base-200': dragover
					}}
					ondragover={(e) => {
						e.preventDefault();
						dragover = true;
					}}
					ondragleave={(e) => {
						e.preventDefault();
						dragover = false;
					}}
					ondrop={handleDrop}
				>
					<div class="px-8 text-center text-sm">Click or drag and drop to add files</div>
				</label>
			</button>
		</div>
	</fieldset>
</div>
