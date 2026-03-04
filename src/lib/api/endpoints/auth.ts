import { unwrappedApi, type Fetch } from '../api';

export type User = {
	id: string;
	username: string;
	email: string;
	role: string;
};

export type LoginResponse = {
	user: User;
	access_token: string;
	refresh_token: string;
};

export async function login(
	apiBase: string,
	fetcher: Fetch,
	credentials: { emailOrUsername: string; password: string },
	signal?: AbortSignal
): Promise<LoginResponse> {
	const url = `${apiBase}/login`;
	return unwrappedApi(fetcher, url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email_or_username: credentials.emailOrUsername,
			password: credentials.password
		}),
		signal
	});
}

export async function logout(
	apiBase: string,
	fetcher: Fetch,
	refreshToken: string,
	signal?: AbortSignal
): Promise<void> {
	const url = `${apiBase}/logout`;
	await unwrappedApi(fetcher, url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ refresh_token: refreshToken }),
		signal
	});
}

export async function register(
	apiBase: string,
	fetcher: Fetch,
	credentials: {
		username: string;
		email: string;
		password: string;
	},
	signal?: AbortSignal
): Promise<User> {
	const url = `${apiBase}/register`;
	return unwrappedApi(fetcher, url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: credentials.username,
			email: credentials.email,
			password: credentials.password
		}),
		signal
	});
}

export type RefreshResponse = {
	access_token: string;
	refresh_token: string;
};

export async function refresh(
	apiBase: string,
	fetcher: Fetch,
	refreshToken: string,
	signal?: AbortSignal
): Promise<RefreshResponse> {
	const url = `${apiBase}/refresh`;
	return unwrappedApi(fetcher, url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refresh_token: refreshToken }),
		signal
	});
}
