import { listMangas } from '$lib/api/endpoints/manga';
import { auth } from '$lib/auth/auth.svelte';
import { buildFetcher } from '$lib/auth/fetcher';
import { apiBase } from '$lib/config';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	if (!auth.isLoggedIn || !auth.user) {
		return error(401, 'Unauthorized');
	}

	const userId = auth.user.id;
	const fethcer = buildFetcher(fetch);

	const paged = await listMangas(apiBase, fethcer, {
		filter: {
			owner_ids: [userId]
		}
	});

	return { mangas: paged.items, totalManga: paged.pagination.total_items };
};
