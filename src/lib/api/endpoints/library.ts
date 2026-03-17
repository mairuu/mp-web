import { unwrappedApi, type Fetch } from '../api';

export type Library = {
	tags: string[];
	mangas: LibraryManga[];
};

export type LibraryManga = {
	manga_id: string;
	tags: string[];
	added_at: string;
};

export type LibraryMangaSummary = {
	tags: string[];
	total_mangas: number;
};

// backend
// func (h *Handler) RegisterRoutes(router gin.IRouter) {
// 	library := router.Group("my/library")
// 	{
// 		library.GET("", h.GetLibrarySummary)
// 		library.GET("mangas", h.GetLibrary)
// 		library.PUT("mangas", h.UpsertLibraryMangas)
// 		library.GET("mangas/:manga_id", h.GetLibraryManga)
// 	}
// }

export async function getLibrarySummary(
	apiBase: string,
	fetcher: Fetch,
	signal?: AbortSignal
): Promise<LibraryMangaSummary> {
	const url = `${apiBase}/my/library`;
	return unwrappedApi(fetcher, url, {
		method: 'GET',
		signal
	});
}

export async function getLibrary(
	apiBase: string,
	fetcher: Fetch,
	signal?: AbortSignal
): Promise<Library> {
	const url = `${apiBase}/my/library/mangas`;
	return unwrappedApi(fetcher, url, {
		method: 'GET',
		signal
	});
}

// empty tags will treat delete the manga from the library,
// otherwise it will be added/updated with the provided tags
export type UpsertLibraryManga = {
	manga_id: string;
	tags?: string[];
};

export async function upsertLibraryMangas(
	apiBase: string,
	fetcher: Fetch,
	mangas: UpsertLibraryManga[],
	signal?: AbortSignal
): Promise<Library> {
	const url = `${apiBase}/my/library/mangas`;
	return unwrappedApi(fetcher, url, {
		method: 'PUT',
		body: JSON.stringify(mangas),
		headers: {
			'Content-Type': 'application/json'
		},
		signal
	});
}

export async function getLibraryManga(
	apiBase: string,
	fetcher: Fetch,
	mangaId: string,
	signal?: AbortSignal
): Promise<LibraryManga | null> {
	const url = `${apiBase}/my/library/mangas/${mangaId}`;
	return unwrappedApi(fetcher, url, {
		method: 'GET',
		signal
	});
}
