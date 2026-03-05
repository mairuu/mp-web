<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { resolve } from '$app/paths';

	let {
		mangaId, // todo:
		title = '',
		hidden = $bindable(false),
		onNext,
		onPrev
	}: {
		mangaId: string;
		title?: string;
		hidden?: boolean;
		onNext?: () => void;
		onPrev?: () => void;
	} = $props();

	const showNav = $derived(!hidden);
</script>

<div
	class={{
		'border- fixed top-0 right-0 left-0 z-50 border-base-content/10 bg-base-100 transition-transform': true,
		'translate-y-[calc((env(safe-area-inset-top)-3.5rem))]': !showNav
	}}
>
	<div class="flex h-14 items-center">
		<a href={resolve('/manga/[id]', { id: mangaId })} class="btn btn-ghost">
			<Menu />
		</a>

		<div class="line-clamp-1">
			{title}
		</div>
	</div>
</div>

<div
	class={{
		'fixed right-0 bottom-0 left-0 z-50 border-t border-base-content/10 bg-base-100 transition-transform': true,
		'translate-y-[calc((env(safe-area-inset-bottom)+3.5rem))]': !showNav
	}}
>
	<div class="flex h-14 items-center justify-end gap-4 px-4">
		<div class="join">
			<button class="btn join-item btn-ghost" disabled={!onPrev} onclick={onPrev}>
				<ChevronLeft />
			</button>
			<button class="btn join-item btn-ghost" disabled={!onNext} onclick={onNext}>
				<ChevronRight />
			</button>
		</div>
	</div>
</div>
