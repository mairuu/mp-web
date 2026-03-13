<script lang="ts">
	import { resolve } from '$app/paths';
	import { listMangas } from '$lib/api/endpoints/manga';
	import { resolveThumbnailUrl } from '$lib/cdn';
	import { apiBase } from '$lib/config';
	import { createPagination } from '$lib/pagination/pagination.svelte';
	import { onMount } from 'svelte';

	const pg = createPagination(async (page, pageSize) =>
		listMangas(apiBase, fetch, { paging: { page, page_size: pageSize } })
	);

	onMount(() => {
		pg.load();
	});
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-2">
		<h1 class="px-2 text-lg font-bold">Marquee Pastry</h1>
	</div>
</div>

<div class="container mx-auto">
	<div class="my-4">
		{@render mangalists()}
	</div>
</div>

{#snippet mangalists()}
	{#if pg.loading}
		<p>Loading...</p>
	{:else if pg.isEmpty}
		<p>No mangas found.</p>
	{:else}
		<div class="grid grid-cols-3 gap-2 px-4 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
			{#each pg.items as manga (manga.id)}
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
	{/if}
{/snippet}
