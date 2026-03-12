<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import SquarePen from '@lucide/svelte/icons/square-pen';

	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import ChapterGroup from './ChapterGroup.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Nav from './Nav.svelte';
	import { goto } from '$app/navigation';
	import { resolveObjectUrl, resolveThumbnailUrl } from '$lib/cdn';
	import ImagePreviewDialog from '$lib/components/image/ImagePreviewDialog.svelte';

	const props: PageProps = $props();

	const { title, synopsis } = $derived(props.data.manga);
	const chapters = $derived(props.data.chapters);
	const coverUrl = $derived(props.data.coverUrl);

	onMount(() => {
		const fromChapterId = page.state.fromChapterId as string | undefined;
		if (!fromChapterId) return;
		if (!chapters.some((c) => c.id === fromChapterId)) return;
		document
			.querySelector(`[data-chapter-id="${fromChapterId}"]`)
			?.scrollIntoView({ block: 'center' });
	});

	function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
		return arr.reduce(
			(groups, item) => {
				const key = keyFn(item);
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(item);
				return groups;
			},
			{} as Record<string, T[]>
		);
	}

	const groupByVolume = $derived(
		(
			Object.entries(groupBy(chapters, (chapter) => chapter.volume || '')) as [
				string,
				typeof chapters
			][]
		).sort(([a], [b]) => {
			if (a === '') return -1;
			if (b === '') return 1;
			return parseFloat(b) - parseFloat(a);
		})
	);

	let tab: 'chapters' | 'covers' | 'manage' = $state('chapters');
	let previewImageUrl = $state<string | null>(null);

	function handleGoBack() {
		goto(resolve('/'));
	}
</script>

<Nav onBack={handleGoBack}>
	<div class="line-clamp-1">
		{title}
	</div>
</Nav>

<div class="absolute top-0 h-64 w-full overflow-hidden">
	<div
		class="absolute inset-0 bg-[0_30%] bg-cover blur-sm brightness-[.6] contrast-125 grayscale-[0.2]"
		style="background-image: url({coverUrl})"
	></div>
	<div class="absolute inset-0 bg-linear-to-b from-transparent to-base-100"></div>
</div>

<div class="relative container mx-auto">
	<div class="flex flex-col gap-4 px-4 pt-6 sm:flex-row">
		<div class="aspect-5/7 w-[22vw] max-w-44 min-w-40 shrink-0 self-center">
			<img class="block h-full w-full rounded object-cover" src={coverUrl} alt="" />
		</div>

		<h1
			class="mt-auto text-center text-[calc(max(min(2rem,3vw),1rem))] leading-tight font-bold sm:text-left"
		>
			{title}
		</h1>
	</div>

	<div class="my-4 px-4 text-sm text-base-content/60">
		{#each synopsis.split('\n') as line, i (i)}
			<p class="my-4">{line}</p>
		{/each}
	</div>

	<div class="sticky top-14 z-10 bg-base-100">
		<div role="tablist" class="tabs-lift tabs">
			<span class="tab w-4 shrink-0 grow-0 p-0"></span>
			{@render tab_button('chapters', 'Chapters')}
			{@render tab_button('covers', 'Covers')}
			{@render tab_button('manage', 'Manage')}
			<span class="tab grow"></span>
		</div>
	</div>

	<!-- <div class="m-4 flex flex-wrap gap-2">
		{#each project?.genres || [] as genre}
			<a href="/search?genres={genre}" class="badge">{genre}</a>
		{/each}
	</div> -->

	<div class="min-h-[calc(100svh-6rem)]">
		{#if tab === 'chapters'}
			{@render tab_chapters()}
		{:else if tab === 'covers'}
			{@render tab_covers()}
		{:else if tab === 'manage'}
			{@render tab_manage()}
		{/if}
	</div>
</div>

{#snippet tab_button(t: typeof tab, label: string)}
	<button role="tab" class="tab" class:tab-active={tab === t} onclick={() => (tab = t)}
		>{label}</button
	>
{/snippet}

{#snippet tab_chapters()}
	{#each groupByVolume as [volume, chapters] (volume)}
		<ChapterGroup {volume} {chapters} />
	{/each}
{/snippet}

{#snippet tab_covers()}
	<div class="sticky top-24 z-10 h-4 bg-base-100"></div>
	<div
		class="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
	>
		{#each props.data.manga.covers as cover (cover.object_name)}
			<div class="relative aspect-5/7 w-full">
				<button
					class="cursor-pointer"
					onclick={() => (previewImageUrl = resolveObjectUrl(cover.object_name))}
				>
					<img
						src={resolveThumbnailUrl(cover.object_name)}
						class="absolute inset-0 max-h-full w-full rounded-box object-cover"
						alt=""
					/>
				</button>

				<span class="absolute bottom-2 left-2 badge">
					{cover.volume ? `Volume ${cover.volume}` : 'No volume'}
				</span>
			</div>
		{/each}
	</div>

	<ImagePreviewDialog bind:imageUrl={previewImageUrl} />
{/snippet}

{#snippet tab_manage()}
	<div class="p-4">
		<a class="btn" href={resolve(`/(app)/manga/[id]/edit`, { id: props.data.manga.id })}>
			<SquarePen />
		</a>

		<a class="btn" href={resolve(`/(app)/manga/[id]/upload`, { id: props.data.manga.id })}>
			<Upload />
		</a>
	</div>
{/snippet}
