<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		hidden = $bindable(false),
		onNext,
		onPrev
	}: {
		hidden?: boolean;
		onNext?: () => void;
		onPrev?: () => void;
	} = $props();

	const showNav = $derived(!hidden);
</script>

<div
	class={{
		'pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-base-content/10 bg-base-100 transition-transform': true,
		'translate-y-[calc((env(safe-area-inset-bottom)+3.5rem))]': !showNav
	}}
>
	<div class="flex h-14 items-center justify-end gap-4 px-4">
		<div class="join">
			<button class="btn join-item" disabled={!onPrev} onclick={onPrev}>
				<ChevronLeft />
			</button>
			<button class="btn join-item" disabled={!onNext} onclick={onNext}>
				<ChevronRight />
			</button>
		</div>
	</div>
</div>
