import { type Fetch, createFetcher } from '$lib/api/api';
import * as api from '$lib/api/endpoints/auth';
import {
	TokenRefreshCoordinator,
	accessTokenMiddleware,
	tokenRefreshMiddleware
} from '$lib/api/middleware';
import { apiBase } from '$lib/config';
import { defaultSession } from './session.svelte';

// shared across all fetcher instances to prevent concurrent refresh races
const refreshCoordinator = new TokenRefreshCoordinator();

/**
 * builds an authenticated fetch pipeline
 * automatically injects the access token and handles silent token refresh.
 *
 * @param base - the per-request fetch provided by SvelteKit's load context or the global fetch
 * @returns a fetch function that automatically handles authentication
 */
export function buildFetcher(base: Fetch): Fetch {
	const { token, refreshToken } = defaultSession.value ?? {};

	if (!token || !refreshToken) {
		return base;
	}

	function tokenFactory() {
		const session = defaultSession.value;
		if (!session) {
			throw new Error('no session available');
		}
		return session.token;
	}

	return createFetcher(
		base,
		accessTokenMiddleware(tokenFactory),
		tokenRefreshMiddleware(
			refreshCoordinator,
			refreshToken,
			async (rt) => {
				const res = await api.refresh(apiBase, base, rt);
				defaultSession.set({
					...defaultSession.value!,
					token: res.access_token,
					refreshToken: res.refresh_token
				});
				return { token: res.access_token, refreshToken: res.refresh_token };
			},
			() => defaultSession.clear()
		)
	);
}
