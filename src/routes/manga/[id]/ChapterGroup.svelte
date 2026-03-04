<script module lang="ts">
	const dateFormat = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return dateFormat.format(date);
	}
</script>

<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	import { resolve } from '$app/paths';
	import type { ChapterSummary } from '$lib/api/endpoints/chapter';
	import { slide } from 'svelte/transition';

	let {
		volume,
		chapters
	}: {
		volume: string;
		chapters: ChapterSummary[];
	} = $props();

	let collapsed = $state(false);

	const firstChapter = $derived(chapters?.[chapters.length - 1]);
	const lastChapter = $derived(chapters?.[0]);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="sticky top-0 z-10 grid cursor-pointer grid-cols-3 border-b border-base-content/30 bg-base-100 p-4 hover:bg-base-content/5"
	onclick={() => (collapsed = !collapsed)}
>
	<span class="">{volume === '' ? 'No Volume' : `Volume ${volume}`}</span>
	<span class="text-center"
		>Ch.

		{#if firstChapter && lastChapter}
			{firstChapter.number}
			{#if firstChapter.number !== lastChapter.number}
				-&nbsp;{lastChapter.number}
			{/if}
		{/if}
	</span>
	<span class="flex items-center justify-end gap-1">
		{chapters.length}

		<ChevronDown
			class={{ 'h-4 w-4 transition-transform duration-50': true, 'rotate-180': !collapsed }}
		/>
	</span>
</div>

{#if !collapsed}
	<div class="grid" transition:slide>
		{#each chapters as chapter (chapter.id)}
			<a
				class="group flex items-center border-b border-base-content/10 py-3 text-sm hover:bg-primary/60"
				href={resolve(`/chapter/[id]`, { id: chapter.id })}
			>
				<div class="grid w-12 shrink-0 place-items-center group-visited:text-success">
					{chapter.number}
				</div>
				<div class="flex-1">
					<span class="block">
						{chapter.title}
					</span>
					<span class="block items-baseline text-sm text-base-content/60">
						{formatDate(chapter.created_at)}
					</span>
				</div>
			</a>
		{/each}
	</div>
{/if}
