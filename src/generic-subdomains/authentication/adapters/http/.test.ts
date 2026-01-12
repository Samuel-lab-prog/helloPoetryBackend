import { Elysia } from 'elysia';
import { describe, it, expect, mock } from 'bun:test';
import { createAuthRouter } from './AuthRouter.ts';

const login = mock(() =>
	Promise.resolve({ token: 'test-token', client: { id: 1, role: 'user' } }),
);
const mockedAuthRouter = createAuthRouter({ login });
const PREFIX = 'http://test/auth';

function createApp() {
	return new Elysia().use(mockedAuthRouter);
}

function jsonRequest(
	url: string,
	options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
) {
	return new Request(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
}

describe('Auth controller tests', () => {
	it('POST /login -> Should return 204 if credentials are valid', async () => {
		const resp = await createApp().handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'normaluser@gmail.com',
					password: 'normaluserpassword',
				},
			}),
		);
		expect(resp.status).toBe(204);
	});

	it('POST /login -> Should return 422 if body is invalid', async () => {
		const resp = await createApp().handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'invalidEmail',
				},
			}),
		);
		expect(resp.status).toBe(422);
	});
});
