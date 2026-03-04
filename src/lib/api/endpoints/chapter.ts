import {
	applyOrderParams,
	applyParams,
	unwrappedApi,
	type Fetch,
	type OrderQuery,
	type Paged,
	type PagingQuery
} from '../api';

export type Chapter = {
	id: string;
	manga_id: string;
	number: string;
	title?: string;
	volume?: string;
	pages: ChapterPage[];
};

export type ChapterPage = {
	width: number;
	height: number;
	object_name: string;
};

export type ChapterSummary = {
	id: string;
	manga_id: string;
	number: string;
	title?: string;
	volume?: string;
	created_at: string;
};

export type ChapterListQuery = {
	filter?: ChapterFilter;
	orders?: OrderQuery[];
	paging?: PagingQuery;
};

export type ChapterFilter = {
	ids?: string[];
	manga_ids?: string[];
	title?: string;
	volume?: string;
};

export async function listChapters(
	apiBase: string,
	fetcher: Fetch,
	query: ChapterListQuery = {},
	signal?: AbortSignal
): Promise<Paged<ChapterSummary>> {
	const url = new URL(`${apiBase}/chapters`);
	applyParams(url.searchParams, query.filter);
	applyParams(url.searchParams, query.paging);
	applyOrderParams(url.searchParams, query.orders);
	url.searchParams.sort();
	return unwrappedApi(fetcher, url, { signal });
}

export async function getChapter(
	apiBase: string,
	fetcher: Fetch,
	id: string,
	signal?: AbortSignal
): Promise<Chapter> {
	const url = `${apiBase}/chapters/${id}`;
	return unwrappedApi(fetcher, url, { signal });
}

export type CreateChapter = {
	manga_id: string;
	number: string;
	title?: string;
	volume?: string;
	pages?: string[]; // object names of the page images
};

export async function createChapter(
	apiBase: string,
	fetcher: Fetch,
	chapter: CreateChapter
): Promise<Chapter> {
	const url = `${apiBase}/chapters`;
	return unwrappedApi(fetcher, url, {
		method: 'POST',
		body: JSON.stringify(chapter),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export async function updateChapter(
	apiBase: string,
	fetcher: Fetch,
	id: string,
	chapter: Partial<CreateChapter>
): Promise<Chapter> {
	const url = `${apiBase}/chapters/${id}`;
	return unwrappedApi(fetcher, url, {
		method: 'PUT',
		body: JSON.stringify(chapter),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
