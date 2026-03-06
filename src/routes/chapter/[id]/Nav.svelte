<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		title = '',
		hidden = $bindable(false),
		onMenu,
		onNext,
		onPrev
	}: {
		title?: string;
		hidden?: boolean;
		onMenu?: () => void;
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
	<div class="flex h-14 items-center gap-2 px-2">
		<button onclick={onMenu} class="btn btn-square btn-ghost">
			<Menu class="h-6 w-6" />
		</button>

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
	<div class="flex h-14 items-center justify-end px-2">
		<div class="join">
			<button class="btn join-item btn-square btn-ghost" disabled={!onPrev} onclick={onPrev}>
				<ChevronLeft class="h-6 w-6" />
			</button>
			<button class="btn join-item btn-square btn-ghost" disabled={!onNext} onclick={onNext}>
				<ChevronRight class="h-6 w-6" />
			</button>
		</div>
	</div>
</div>
