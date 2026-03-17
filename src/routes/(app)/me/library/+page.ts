import { getLibrary } from '$lib/api/endpoints/library';
import { listMangas } from '$lib/api/endpoints/manga';
import { auth } from '$lib/auth/auth.svelte';
import { buildFetcher } from '$lib/auth/fetcher';
import { apiBase } from '$lib/config';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	if (!auth.isLoggedIn) {
		throw redirect(302, '/login');
	}

	const fetcher = buildFetcher(fetch);

	const library = await getLibrary(apiBase, fetcher);

	const pagedMangas = await listMangas(apiBase, fetcher, {
		filter: {
			ids: library.mangas.map((m) => m.manga_id)
		}
	});

	const mangas = pagedMangas.items;

	return { library, mangas };
};
