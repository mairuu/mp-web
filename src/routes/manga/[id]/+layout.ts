import { getManga } from '$lib/api/endpoints/manga';
import { getPrimaryCoverUrl } from '$lib/cdn';
import { buildFetcher } from '$lib/auth/fetcher';
import { apiBase } from '$lib/config';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, fetch, depends }) => {
	const fetcher = buildFetcher(fetch);
	const manga = await getManga(apiBase, fetcher, params.id);
	depends(`manga:${manga.id}`);

	return {
		manga: manga,
		coverUrl: getPrimaryCoverUrl(manga)
	};
};
