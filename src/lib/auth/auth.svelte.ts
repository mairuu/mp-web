import { ApiError, type Fetch } from '$lib/api/api';
import * as api from '$lib/api/endpoints/auth';
import { apiBase } from '$lib/config';
import { createSession, defaultSession } from './session.svelte';

function createAuth(apiBase: string, fetcher: Fetch, session: ReturnType<typeof createSession>) {
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function login(email: string, password: string) {
		loading = true;
		error = null;
		try {
			const res = await api.login(apiBase, fetcher, { emailOrUsername: email, password });
			session.set({ user: res.user, token: res.access_token, refreshToken: res.refresh_token });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'unknown error';
		} finally {
			loading = false;
		}
	}

	async function register(username: string, email: string, password: string) {
		loading = true;
		error = null;
		try {
			// register does not log in the user automatically
			await api.register(apiBase, fetcher, { username, email, password });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'unknown error';
		} finally {
			loading = false;
		}
	}

	async function logout() {
		const refreshToken = session.value?.refreshToken;
		if (!refreshToken) {
			session.clear();
			return;
		}

		loading = true;

		try {
			await api.logout(apiBase, fetcher, refreshToken);
		} finally {
			loading = false;
		}
		session.clear();
	}

	return {
		get user() {
			return session.value?.user;
		},
		get token() {
			return session.value?.token;
		},
		get isLoggedIn() {
			return session.isLoggedIn;
		},
		get displayName() {
			return session.displayName;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		register,
		login,
		logout
	};
}

export const auth = createAuth(apiBase, fetch, defaultSession);
