import { getChapter } from '$lib/api/endpoints/chapter';
import { buildFetcher } from '$lib/auth/fetcher';
import { apiBase } from '$lib/config';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, fetch, depends }) => {
	const fetcher = buildFetcher(fetch);
	const chapter = await getChapter(apiBase, fetcher, params.id);
	depends(`chapter:${params.id}`);
	return { chapter };
};
