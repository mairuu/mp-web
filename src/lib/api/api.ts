export type Fetch = typeof fetch;

export type ApiResponse<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };

export type OrderQuery = {
	field: string;
	direction: 'asc' | 'desc';
};

export type Paged<T> = {
	items: T[];
	pagination: Pagination;
};

export type Pagination = {
	total_items: number;
	total_pages: number;
	page: number;
	page_size: number;
};

export type PagingQuery = {
	page: number;
	page_size: number;
};

/*
 * a wrapper around the api function that unwraps the ApiResponse
 * and returns the data directly, or throws an error if the response
 * indicates failure.
 */
export async function unwrappedApi<T>(
	fetcher: Fetch,
	input: Parameters<Fetch>[0],
	init?: Parameters<Fetch>[1]
): Promise<T> {
	try {
		return await _unwrappedApi(fetcher, input, init);
	} catch (err) {
		if (import.meta.env.DEV) {
			console.error('API error:', err);
		}
		throw err;
	}
}

async function _unwrappedApi<T>(
	fetcher: Fetch,
	input: Parameters<Fetch>[0],
	init?: Parameters<Fetch>[1]
): Promise<T> {
	const response = await fetcher(input, init);

	if (!response.ok) {
		throw new Error(`network response was not ok: ${response.status} ${response.statusText}`);
	}

	let result: ApiResponse<T>;
	try {
		result = (await response.json()) as ApiResponse<T>;
	} catch {
		throw new Error('response is not valid JSON');
	}

	if (!result || typeof result !== 'object' || !('success' in result)) {
		throw new Error('response does not match expected ApiResponse shape');
	}

	if (!result.success) {
		throw parseError(result.error);
	}

	// at this point, result.success is true, so result.data is expected to exist.
	if (typeof result.data === 'undefined') {
		throw new Error('api response is missing expected data');
	}

	return result.data;
}

function parseError(error: unknown): Error {
	let msg: string = 'unknown error';
	let code = 'unknown_error';
	const details: Record<string, string> = {};

	if (typeof error === 'string') {
		// we may get structured line protocol errors format:
		// code=error_code; message=optional message; key1=value1; key2=value2

		// sniff
		if (!error.startsWith('code=') || !error.includes(';')) {
			return new ApiError(code, error);
		}

		const parts = error.split(';').map((part) => part.trim());
		const partRegex = /^([^=]+)=([^=]+)$/;

		for (const part of parts) {
			const match = part.match(partRegex);
			if (!match) {
				continue;
			}
			const [, key, value] = match;

			if (key === 'code') {
				code = value;
			} else if (key === 'message') {
				msg = value;
			} else {
				details[key] = value;
			}
		}
	}

	return new ApiError(code, msg, details);
}

// ApiError represents an error returned from the API.
export class ApiError extends Error {
	constructor(
		public code: string,
		message: string,
		public details?: Record<string, string>
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// middleware

export type FetchMiddleware = (next: Fetch) => Fetch;

export type RefreshResult = {
	token: string;
	refreshToken: string;
};

/**
 * composes a fetch pipeline from a base fetcher and a list of middlewares.
 * Middlewares are applied left-to-right (first = outermost).
 */
export function createFetcher(base: Fetch, ...middlewares: FetchMiddleware[]): Fetch {
	return middlewares.reduceRight((next, mw) => mw(next), base);
}

// utilities

export function injectAccessToken(fetcher: Fetch, token?: string | null): Fetch {
	if (!token) {
		return fetcher;
	}
	return (input: Parameters<Fetch>[0], init?: Parameters<Fetch>[1]) => {
		const headers = new Headers(init?.headers || {});
		headers.set('Authorization', `Bearer ${token}`);
		return fetcher(input, { ...init, headers });
	};
}

export function applyOrderParams(p: URLSearchParams, orders?: OrderQuery[]) {
	if (!orders) {
		return;
	}
	for (const { field, direction } of orders) {
		const dir = direction.toLowerCase() === 'asc' ? 'asc' : 'desc';
		p.append('orders[]', `${field},${dir}`);
	}
}

export function applyParams(
	p: URLSearchParams,
	params?: Record<string, string | number | boolean | (string | number | boolean)[]>
) {
	if (!params) {
		return;
	}

	for (const [key, value] of Object.entries(params)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				p.append(`${key}[]`, v.toString());
			}
		} else {
			p.append(key, value.toString());
		}
	}
}
