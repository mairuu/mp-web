import { listChapters } from '$lib/api/endpoints/chapter';
import { buildFetcher } from '$lib/auth/fetcher';
import { apiBase } from '$lib/config';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const fetcher = buildFetcher(fetch);

	const paged = await listChapters(apiBase, fetcher, {
		filter: {
			manga_ids: [params.id]
		},
		paging: {
			page: 1,
			page_size: 10000 // virtually no limit, we just want to get all chapters for the manga
		},
		orders: [{ field: 'number', direction: 'desc' }]
	});

	return { chapters: paged.items, totalChapters: paged.pagination.total_items };
};
