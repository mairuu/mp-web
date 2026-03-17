import { injectAccessToken, type FetchMiddleware, type RefreshResult } from './api';

export class TokenRefreshCoordinator {
	refreshingPromise: Promise<RefreshResult> | null = null;
}

export function accessTokenMiddleware(tokenFactory: () => string): FetchMiddleware {
	return (next) => (input, init) => {
		const token = tokenFactory();
		return injectAccessToken(next, token)(input, init);
	};
}

export function tokenRefreshMiddleware(
	coordinator: TokenRefreshCoordinator,
	refreshToken: string,
	onRefresh: (refreshToken: string) => Promise<RefreshResult>,
	onFailure: () => void
): FetchMiddleware {
	return (next) => async (input, init) => {
		if (!refreshToken) {
			return next(input, init);
		}

		// for further improvements, we can preemptively refresh the token

		const response = await next(input, init);

		if (response.status !== 401) return response;

		if (!coordinator.refreshingPromise) {
			coordinator.refreshingPromise = onRefresh(refreshToken).finally(() => {
				coordinator.refreshingPromise = null;
			});
		}

		let newTokens: RefreshResult;
		try {
			newTokens = await coordinator.refreshingPromise;
		} catch {
			onFailure();
			return response;
		}

		// bypass the stale token already injected by accessTokenMiddleware
		const headers = new Headers(init?.headers ?? {});
		headers.set('Authorization', `Bearer ${newTokens.token}`);
		return next(input, { ...init, headers });
	};
}
