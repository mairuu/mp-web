import {
	applyOrderParams,
	applyParams,
	unwrappedApi,
	type Fetch,
	type OrderQuery,
	type Paged,
	type PagingQuery
} from '../api';

export type MangaSummary = {
	id: string;
	title: string;
	cover_object_name: string | null;
};

export type Manga = {
	id: string;
	title: string;
	synopsis: string;
	status: string;
	covers: CoverArt[];
};

export type CoverArt = {
	volume?: string;
	is_primary: boolean;
	description: string;
	object_name: string;
};

export type CreateManga = {
	title: string;
	synopsis?: string;
	status: string;
	covers: CreateMangaCover[];
};

export type CreateMangaCover = {
	object_name: string;
	volume?: string;
	is_primary?: boolean;
	description?: string;
};

export async function createManga(
	apiBase: string,
	fetcher: Fetch,
	manga: CreateManga,
	signal?: AbortSignal
): Promise<Manga> {
	const url = `${apiBase}/mangas`;
	return unwrappedApi(fetcher, url, {
		method: 'POST',
		body: JSON.stringify(manga),
		headers: {
			'Content-Type': 'application/json'
		},
		signal
	});
}

export async function updateManga(
	apiBase: string,
	fetcher: Fetch,
	mangaId: string,
	manga: Partial<CreateManga>,
	signal?: AbortSignal
): Promise<Manga> {
	const url = `${apiBase}/mangas/${mangaId}`;
	return unwrappedApi(fetcher, url, {
		method: 'PUT',
		body: JSON.stringify(manga),
		headers: {
			'Content-Type': 'application/json'
		},
		signal
	});
}

export type MangaListQuery = {
	filter?: MangaFilter;
	paging?: PagingQuery;
	orders?: OrderQuery[];
};

export type MangaFilter = {
	ids?: string[];
	owner_ids?: string[];
	title?: string;
};

export async function listMangas(
	apiBase: string,
	fetcher: Fetch,
	query: MangaListQuery = {},
	signal?: AbortSignal
): Promise<Paged<MangaSummary>> {
	const url = new URL(`${apiBase}/mangas`);
	applyParams(url.searchParams, query.filter);
	applyParams(url.searchParams, query.paging);
	applyOrderParams(url.searchParams, query.orders);
	url.searchParams.sort();
	return unwrappedApi(fetcher, url, { signal });
}

export async function getManga(
	apiBase: string,
	fetcher: Fetch,
	mangaId: string,
	signal?: AbortSignal
): Promise<Manga> {
	const url = `${apiBase}/mangas/${mangaId}`;
	return unwrappedApi(fetcher, url, { signal });
}
