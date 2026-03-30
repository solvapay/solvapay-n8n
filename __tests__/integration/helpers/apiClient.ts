/* eslint-disable */
const BASE_URL = process.env['SOLVAPAY_API_URL'] || 'https://api.solvapay.com/v1/sdk';

function getApiKey(): string {
	const key = process.env['SOLVAPAY_TEST_API_KEY'];
	if (!key) throw new Error('SOLVAPAY_TEST_API_KEY is not set');
	return key;
}

interface RequestOptions {
	method: string;
	path: string;
	body?: Record<string, unknown>;
	query?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = Record<string, unknown>> {
	status: number;
	data: T;
}

async function request<T = Record<string, unknown>>(opts: RequestOptions): Promise<ApiResponse<T>> {
	let url = `${BASE_URL}${opts.path}`;
	if (opts.query) {
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(opts.query)) {
			params.append(k, String(v));
		}
		url += `?${params.toString()}`;
	}

	const headers: Record<string, string> = {
		'X-API-Key': getApiKey(),
		'Content-Type': 'application/json',
	};

	const fetchOpts: RequestInit = { method: opts.method, headers };
	if (opts.body) fetchOpts.body = JSON.stringify(opts.body);

	const res = await fetch(url, fetchOpts);
	const text = await res.text();
	let data: T;
	try {
		data = JSON.parse(text) as T;
	} catch {
		data = text as unknown as T;
	}

	return { status: res.status, data };
}

export const api = {
	get: <T = Record<string, unknown>>(path: string, query?: Record<string, string | number | boolean>) =>
		request<T>({ method: 'GET', path, query }),

	post: <T = Record<string, unknown>>(path: string, body?: Record<string, unknown>) =>
		request<T>({ method: 'POST', path, body }),

	patch: <T = Record<string, unknown>>(path: string, body?: Record<string, unknown>) =>
		request<T>({ method: 'PATCH', path, body }),

	put: <T = Record<string, unknown>>(path: string, body?: Record<string, unknown>) =>
		request<T>({ method: 'PUT', path, body }),

	del: <T = Record<string, unknown>>(path: string) =>
		request<T>({ method: 'DELETE', path }),
};

export function skipIfNoKey(): void {
	if (!process.env['SOLVAPAY_TEST_API_KEY']) {
		test.only('skipping — no API key', () => {});
	}
}
