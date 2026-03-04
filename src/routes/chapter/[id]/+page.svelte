<script lang="ts">
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import { onMount } from 'svelte';

	import { resolveObjectUrl } from '$lib/cdn';
	import { createPullToNext } from '$lib/components/chapter/pullToNext.svelte';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import Nav from './Nav.svelte';

	const { data }: PageProps = $props();
	const chapter = $derived(data.chapter);
	const chapters = $derived(data.chapters);

	let loading = $state(false);
	$effect(() => {
		document.body.style.overflow = loading ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	let navHidden = $state(false);

	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	const isDescending = $derived(
		chapters.length > 2 &&
			chapters[0].number.padStart(10, '0') > chapters[1].number.padStart(10, '0')
	);
	const currentChapterIndex = $derived(chapters.findIndex((c) => c.id === chapter.id));
	const hasPrevChapter = $derived(
		isDescending
			? currentChapterIndex !== -1 && currentChapterIndex < chapters.length - 1
			: currentChapterIndex > 0
	);
	const hasNextChapter = $derived(
		isDescending
			? currentChapterIndex > 0
			: currentChapterIndex !== -1 && currentChapterIndex < chapters.length - 1
	);

	const handleGoPrevChapter = $derived(hasPrevChapter ? goToPrevChapter : undefined);
	const handleGoNextChapter = $derived(hasNextChapter ? goToNextChapter : undefined);

	async function goToNextChapter() {
		if (chapters.length < 2) return;

		const nextChapter = isDescending
			? chapters[currentChapterIndex - 1]
			: chapters[currentChapterIndex + 1];
		if (!nextChapter) return;

		try {
			loading = true;
			await goto(resolve(`/chapter/[id]`, { id: nextChapter.id }));
		} finally {
			loading = false;
		}
	}

	async function goToPrevChapter() {
		if (chapters.length < 2) return;

		const prevChapter = isDescending
			? chapters[currentChapterIndex + 1]
			: chapters[currentChapterIndex - 1];
		if (!prevChapter) return;

		try {
			loading = true;
			await goto(resolve(`/chapter/[id]`, { id: prevChapter.id }));
		} finally {
			loading = false;
		}
	}
	const pull = createPullToNext(() => {
		goToNextChapter();
	});

	const CIRCLE_RADIUS = 16;
	const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

	const showPullToNext = $derived(isTouchDevice && hasNextChapter);
	const circleDashOffset = $derived(CIRCLE_CIRCUMFERENCE * (1 - pull.pullProgress));

	$effect(() => {
		if (showPullToNext) {
			pull.enable();
		} else {
			pull.disable();
		}
	});

	onMount(() => {
		return () => pull.disable();
	});
</script>

<Nav bind:hidden={navHidden} onNext={handleGoNextChapter} onPrev={handleGoPrevChapter} />

<div class="">
	<div class="mx-auto w-full max-w-xl px-4 pt-4">
		<h1 class="mb-2 text-2xl font-bold">{chapter.title}</h1>
		<p class="mb-4 text-sm text-gray-500">Chapter {chapter.number}</p>

		<a class="btn" href={resolve(`/chapter/[id]/edit`, { id: chapter.id })}>
			<SquarePen />
		</a>
	</div>

	<div class="divider"></div>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		style:transform="translateY({-pull.pullHeight}px)"
		class="flex flex-col items-center gap-2"
		onclick={() => (navHidden = !navHidden)}
	>
		{#each chapter.pages as page (page.object_name)}
			<img
				src={resolveObjectUrl(page.object_name)}
				class="max-w-full"
				loading="lazy"
				width={page.width}
				height={page.height}
				alt=""
			/>
		{/each}
	</div>
</div>

{#if loading}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-base-100/70"
		ontouchstartcapture={(e) => e.stopPropagation()}
	>
		<div class="loading loading-xl loading-ring"></div>
	</div>
{/if}

{#if showPullToNext}
	<div
		class="flex flex-col items-center border-t border-base-content/10 bg-base-200 pt-8 pb-[calc(2em+env(safe-area-inset-bottom))]"
		style:transform="translateY({-pull.pullHeight}px)"
	>
		<!-- progress circle around arrow -->
		<div class="relative flex items-center justify-center">
			<svg
				class="absolute"
				width={CIRCLE_RADIUS * 2 + 8}
				height={CIRCLE_RADIUS * 2 + 8}
				viewBox="0 0 {CIRCLE_RADIUS * 2 + 8} {CIRCLE_RADIUS * 2 + 8}"
			>
				<!-- track -->
				<circle
					cx={CIRCLE_RADIUS + 4}
					cy={CIRCLE_RADIUS + 4}
					r={CIRCLE_RADIUS}
					fill="none"
					class="stroke-base-content/10"
					stroke-width="2"
				/>
				<!-- progress -->
				<circle
					cx={CIRCLE_RADIUS + 4}
					cy={CIRCLE_RADIUS + 4}
					r={CIRCLE_RADIUS}
					fill="none"
					class="stroke-primary transition-all duration-75"
					stroke-width="2"
					stroke-linecap="round"
					stroke-dasharray={CIRCLE_CIRCUMFERENCE}
					stroke-dashoffset={circleDashOffset}
					transform="rotate(-90 {CIRCLE_RADIUS + 4} {CIRCLE_RADIUS + 4})"
				/>
			</svg>

			<ArrowDown
				class={{
					'h-4 w-4 transition-transform duration-300': true,
					'rotate-180': pull.isTriggered
				}}
			/>
		</div>

		<span class="mt-3 text-sm text-base-content/70">
			{#if pull.isTriggered}
				Release to next chapter
			{:else}
				Pull up to next chapter
			{/if}
		</span>

		<div class="h-14"></div>
		<div style:min-height="{pull.pullHeight}px"></div>
	</div>
{:else}
	<div class="h-14"></div>
{/if}
