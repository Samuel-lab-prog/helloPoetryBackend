import type { HeadersInit } from 'bun';
import { createUser, loginUser, type TestUser } from 'tests/Helpers';
import { testUsersData } from './poems-management/Data';

type JsonRequestOptions<TBody = unknown> = Omit<
	RequestInit,
	'body' | 'headers'
> & {
	body?: TBody;
	headers?: HeadersInit;
};

/**
 * Create a Request with JSON headers and body.
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
/**
 * Sets up 3 test users by creating and logging them in.
 * @returns A promise that resolves to an array of logged-in test users.
 */
export async function setupHttpUsers(): Promise<TestUser[]> {
	const userPromises = testUsersData.map((data) => createUser(data));
	let users = await Promise.all(userPromises);

	const loginPromises = users.map((user) => loginUser(user));
	users = await Promise.all(loginPromises);

	return users;
}
