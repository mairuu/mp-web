<script lang="ts">
	import { resolve } from '$app/paths';
	import { listMangas } from '$lib/api/endpoints/manga';
	import { resolveThumbnailUrl } from '$lib/cdn';
	import { auth } from '$lib/auth/auth.svelte';
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

<div class="container mx-auto">
	{#if !auth.isLoggedIn}
		<a href={resolve('/(auth)/login')} class="btn"> login </a>
	{/if}

	{#if auth.isLoggedIn}
		<p>Welcome, {auth.displayName}</p>
		<button class="btn" onclick={auth.logout}> logout </button>
		<a href={resolve('/manga/create')} class="btn">Create Manga</a>
	{/if}

	<div>
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
				<div class="">
					<div class="relative flex w-full items-center justify-center" style:padding-bottom="140%">
						<div
							class="absolute inset-0 flex items-center justify-center rounded-box bg-cover bg-center"
							style:background-image="url({resolveThumbnailUrl(manga.cover_object_name)})"
							role="img"
							aria-label={manga.title}
						></div>
					</div>
					<div>
						<a class="line-clamp-2" href={resolve('/manga/[id]', { id: manga.id })}>
							{manga.title}</a
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}
