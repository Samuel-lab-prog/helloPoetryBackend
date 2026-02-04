import type { HeadersInit } from 'bun';

type JsonRequestOptions<TBody = unknown> = Omit<
	RequestInit,
	'body' | 'headers'
> & {
	body?: TBody;
	headers?: HeadersInit;
};

/**
 * Create a Request with JSON headers and body.
 * @param url The request URL.
 * @param options Request options, including body and headers.
 * @returns A Request object with JSON headers and body.
 * You can pass any type of body, and it will be stringified to JSON.
 */
export function jsonRequest<TBody = unknown>(
	url: string,
	options: JsonRequestOptions<TBody> = {},
) {
	const { body, headers, ...rest } = options;

	const finalHeaders = new Headers(headers);

	if (!finalHeaders.has('Content-Type')) {
		finalHeaders.set('Content-Type', 'application/json');
	}

	return new Request(url, {
		...rest,
		headers: finalHeaders,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
}
