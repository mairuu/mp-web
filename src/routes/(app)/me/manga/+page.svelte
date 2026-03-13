<script lang="ts">
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import SquarePen from '@lucide/svelte/icons/square-pen';

	import { resolve } from '$app/paths';
	import { resolveThumbnailUrl } from '$lib/cdn';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<div class="flex-1">
			<h1 class="text-lg leading-tight font-bold">Your Manga</h1>
			<p class="text-xs text-base-content/50">
				{data.totalManga} title{data.totalManga !== 1 ? 's' : ''}
			</p>
		</div>
		<a href={resolve('/(app)/manga/create')} class="btn gap-1 btn-sm btn-primary">
			<CirclePlus class="size-4" />
			<span class="hidden sm:inline">Create</span>
		</a>
	</div>
</div>

{#if data.mangas.length === 0}
	<div class="flex flex-col items-center gap-4 py-20 text-center">
		<div class="grid size-20 place-items-center rounded-full bg-base-200 text-4xl">📚</div>
		<p class="font-semibold">No manga yet</p>
		<p class="text-sm text-base-content/50">Start by creating your first manga.</p>
		<a href={resolve('/(app)/manga/create')} class="btn btn-primary">Create Manga</a>
	</div>
{:else}
	<div
		class="grid grid-cols-3 gap-2 px-4 pt-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6"
	>
		{#each data.mangas as manga (manga.id)}
			{@const link = resolve('/(app)/manga/[id]', { id: manga.id })}
			{@const editLink = resolve('/(app)/manga/[id]/edit', { id: manga.id })}
			<div>
				<div class="group relative">
					<a href={link} class="relative flex aspect-5/7 w-full items-center justify-center">
						<img
							src={resolveThumbnailUrl(manga.cover_object_name)}
							alt={manga.title}
							class="absolute inset-0 h-full w-full rounded-box object-cover"
						/>
					</a>
					<a
						href={editLink}
						class="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-base-100/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
						aria-label="Edit {manga.title}"
					>
						<SquarePen class="size-3.5" />
					</a>
				</div>
				<a class="mt-1 line-clamp-2 block text-sm leading-snug" href={link}>{manga.title}</a>
			</div>
		{/each}
	</div>
{/if}
