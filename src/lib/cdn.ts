import { cdnBase } from '$lib/config';
import type { Manga } from '$lib/api/endpoints/manga';

export function resolveObjectUrl(objectName?: string | null): string {
	if (!objectName) {
		return '';
	}
	return `${cdnBase}/${objectName}`;
}

export function resolveThumbnailUrl(objectName?: string | null): string {
	return resolveObjectUrl(objectName ? objectName + '_256' : 'default_cover_256');
}

export function resolveCoverUrl(objectName?: string | null): string {
	return resolveObjectUrl(objectName ? objectName + '_512' : 'default_cover_512');
}

export function getPrimaryCoverUrl(manga: Manga): string {
	const cover = manga.covers.find((c) => c.is_primary) ?? manga.covers[manga.covers.length - 1];
	return resolveCoverUrl(cover?.object_name);
}
