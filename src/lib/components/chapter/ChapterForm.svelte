<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';

	import { ChapterFormController } from './ChapterFormController.svelte';
	import { gesture } from './gesture';

	let {
		controller,
		onPreviewPage
	}: {
		controller: ChapterFormController;
		onPreviewPage?: (url: string) => void;
	} = $props();

	let dragSrcIndex: number | null = $state(null);
	let dragOverIndex: number | null = $state(null);
	let clone: HTMLElement | null = null;
	let cardElms: HTMLElement[] = [];
	let offsetX = 0;
	let offsetY = 0;

	function dragStart(e: MouseEvent | TouchEvent, card: HTMLElement, index: number) {
		const rect = card.getBoundingClientRect();
		const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
		const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

		dragSrcIndex = index;
		offsetX = clientX - rect.left;
		offsetY = clientY - rect.top;

		clone?.remove();
		clone = card.cloneNode(true) as HTMLElement;
		clone.style.cssText = `
			position: fixed;
			width: ${rect.width}px;
			height: ${rect.height}px;
			left: ${rect.left}px;
			top: ${rect.top}px;
			cursor: grabbing;
			z-index: 9999;
			opacity: 0.9;
			transform: rotate(2deg) scale(1.03);
			box-shadow: 0 20px 40px rgba(0,0,0,0.4);
			transition: box-shadow 0.1s;
		`;
		clone.querySelectorAll('button')?.forEach((button) => button.remove());
		document.body.appendChild(clone);

		cardElms = Array.from(document.querySelectorAll<HTMLElement>('[data-page-index]'));

		if (e instanceof MouseEvent) {
			window.addEventListener('mousemove', onDragMouseMove);
			window.addEventListener('mouseup', onDragMouseUp);
		} else {
			window.addEventListener('touchmove', onDragTouchMove, { passive: false });
			window.addEventListener('touchend', onDragTouchEnd);
		}
	}

	function moveClone(clientX: number, clientY: number) {
		if (!clone) return;
		clone.style.left = `${clientX - offsetX}px`;
		clone.style.top = `${clientY - offsetY}px`;
	}

	function updateOver(clientX: number, clientY: number) {
		dragOverIndex = null;
		for (const card of cardElms) {
			const { left, right, top, bottom } = card.getBoundingClientRect();
			if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
				const idx = parseInt(card.dataset.pageIndex!);
				if (idx !== dragSrcIndex) dragOverIndex = idx;
				break;
			}
		}
	}

	function commitDrop() {
		clone?.remove();
		clone = null;
		if (dragSrcIndex !== null && dragOverIndex !== null && dragSrcIndex !== dragOverIndex) {
			controller.reorderPage(dragSrcIndex, dragOverIndex);
		}
		cardElms = [];
		dragSrcIndex = null;
		dragOverIndex = null;
	}

	function onDragMouseMove(e: MouseEvent) {
		moveClone(e.clientX, e.clientY);
		updateOver(e.clientX, e.clientY);
	}

	function onDragMouseUp() {
		commitDrop();
		window.removeEventListener('mousemove', onDragMouseMove);
		window.removeEventListener('mouseup', onDragMouseUp);
	}

	function onDragTouchMove(e: TouchEvent) {
		e.preventDefault();
		moveClone(e.touches[0].clientX, e.touches[0].clientY);
		updateOver(e.touches[0].clientX, e.touches[0].clientY);
	}

	function onDragTouchEnd() {
		commitDrop();
		window.removeEventListener('touchmove', onDragTouchMove);
		window.removeEventListener('touchend', onDragTouchEnd);
	}

	function previewPage(url: string) {
		onPreviewPage?.(url);
	}

	let dropzoneActive = $state(false);

	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.multiple = true;
		input.addEventListener('change', () => {
			if (input.files) controller.addFiles(Array.from(input.files));
		});
		input.click();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files) controller.addFiles(Array.from(e.dataTransfer.files));
	}
</script>

<div class="my-4 px-4">
	<div class="grid grid-cols-2 gap-x-7">
		<fieldset class="col-span-2 fieldset sm:col-span-1">
			<legend class="fieldset-legend">Volume Number</legend>
			<input
				type="text"
				id="volume-number"
				class="input w-full"
				placeholder="-"
				bind:value={controller.volume}
			/>
		</fieldset>
		<fieldset class="col-span-2 fieldset sm:col-span-1">
			<legend class="fieldset-legend">Chapter Number</legend>
			<input type="text" id="chapter-number" class="input w-full" bind:value={controller.number} />
		</fieldset>
		<fieldset class="col-span-2 fieldset">
			<legend class="fieldset-legend">Chapter Name</legend>
			<input type="text" class="input w-full" placeholder="-" bind:value={controller.title} />
		</fieldset>
	</div>
</div>

<div class="divider"></div>

<h4 class="my-4 px-4 text-lg font-bold">Pages</h4>

<div class="my-4 px-4">
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		{#each controller.pages as page, i (page.id)}
			<div
				use:gesture={{
					onTap: () => previewPage(page.url),
					onDragStart: (e, node) => dragStart(e, node, i)
				}}
				data-page-index={i}
				role="listitem"
				class={{
					'cursor-grab overflow-hidden rounded-box bg-base-100 transition-opacity duration-150 select-none': true,
					'opacity-30': dragSrcIndex === i,
					'ring-2 ring-primary ring-offset-2': dragOverIndex === i
				}}
			>
				<div class="relative flex aspect-5/7 w-full items-center justify-center">
					<img
						src={page.url}
						class="absolute inset-0 max-h-full w-full rounded-box object-cover"
						alt=""
					/>

					{#if page.upload}
						<div
							class={{
								'absolute inset-0 flex items-center justify-center': true,
								'bg-black/30':
									page.upload.status === 'pending' || page.upload.status === 'uploading',
								'bg-error/30': page.upload.status === 'rejected'
							}}
						>
							{#if page.upload.status === 'pending'}
								<span class="loading loading-ring"></span>
							{:else if page.upload.status === 'uploading'}
								<span class="loading loading-spinner"></span>
							{:else if page.upload.status === 'rejected'}
								<button class="btn btn-circle" onclick={() => controller.retryUploadPage(page)}>
									<RotateCw class="h-4 w-4" />
								</button>
							{/if}
						</div>
					{/if}

					<button
						class="btn absolute top-2 right-2 btn-circle btn-xs"
						onmousedowncapture={(e) => e.stopImmediatePropagation()}
						ontouchstartcapture={(e) => e.stopImmediatePropagation()}
						onclickcapture={() => controller.removePage(page)}
					>
						<X class="h-4 w-4" />
					</button>

					{#if page.upload}
						<span class="absolute right-2 bottom-2 left-2 badge line-clamp-1">
							{page.upload.file.name}
						</span>
					{/if}
				</div>
			</div>
		{/each}

		<button class="relative aspect-5/7" onclick={openFileDialog}>
			<label
				for=""
				class={{
					'absolute inset-0 flex cursor-pointer items-center justify-center rounded-box border-2 border-dashed border-base-content/10 hover:bg-base-200': true,
					'bg-base-200': dropzoneActive
				}}
				ondragover={(e) => {
					e.preventDefault();
					dropzoneActive = true;
				}}
				ondragleave={(e) => {
					e.preventDefault();
					dropzoneActive = false;
				}}
				ondrop={handleDrop}
			>
				<div class="px-8 text-center text-sm">Click or drag and drop to add files</div>
			</label>
		</button>
	</div>
</div>
