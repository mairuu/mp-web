<script lang="ts">
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { resolveThumbnailUrl } from '$lib/cdn';

	const props: PageProps = $props();
	const mangas = $derived(props.data.mangas);
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<h1 class="text-lg font-bold">Library</h1>
	</div>
</div>

{#if mangas.length > 0}
	<div class="my-3">
		<div class="grid grid-cols-3 gap-2 px-4 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
			{#each mangas as manga (manga.id)}
				{@const link = resolve('/(app)/manga/[id]', { id: manga.id })}
				<div class="">
					<a href={link} class="relative flex aspect-5/7 w-full items-center justify-center">
						<img
							src={resolveThumbnailUrl(manga.cover_object_name)}
							alt={manga.title}
							class="absolute inset-0 h-full w-full rounded-box object-cover"
						/>
					</a>
					<a class="line-clamp-2" href={link}> {manga.title}</a>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center gap-4 py-20 text-center">
		<div class="rounded-full bg-base-200 p-4">
			<BookMarked class="size-12 text-primary" />
		</div>
		<p class="font-semibold">Not following anything</p>
		<p class="text-sm text-base-content/50">Manga you follow will appear here.</p>
	</div>
{/if}
