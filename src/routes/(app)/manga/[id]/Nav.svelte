<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import type { Snippet } from 'svelte';

	let {
		hidden = $bindable(false),
		onBack,
		children
	}: {
		hidden?: boolean;
		onBack?: () => void;
		children?: Snippet;
	} = $props();

	let progress = $state(0);
	const showNav = $derived(!hidden);
	const opacity = $derived(showNav ? progress : 0);

	function handleScroll() {
		const scrollY = window.scrollY;
		const progressValue = Math.min(scrollY / 200, 1);
		progress = progressValue;
	}
</script>

<svelte:window onscroll={handleScroll} />

<div
	class={{
		'sticky top-0 z-50 transition-transform': true,
		'translate-y-[calc((env(safe-area-inset-top)-3.5rem))]': !showNav
	}}
>
	<div style:--opacity={opacity} class="absolute inset-0 bg-base-100 opacity-(--opacity)"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-2">
		<button onclick={onBack} class="btn btn-square btn-ghost">
			<ChevronLeft class="h-6 w-6" />
		</button>
		<div style:--opacity={opacity} class="opacity-(--opacity)">
			{@render children?.()}
		</div>
	</div>
</div>
