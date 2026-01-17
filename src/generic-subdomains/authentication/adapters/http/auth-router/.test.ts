/* eslint-disable require-await */
import { Elysia } from 'elysia';
import { describe, it, expect, mock } from 'bun:test';
import { createAuthRouter } from './AuthRouter';

const login = mock(async () => ({
	token: 'test-jwt-token',
	client: { id: 1, role: 'user', status: 'active' },
}));

const PREFIX = 'http://test/auth';

function createApp() {
	return new Elysia().use(createAuthRouter({ login }));
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

describe('AuthRouter', () => {
	it('POST /login -> sets auth cookie and returns 204', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'user@test.com',
					password: 'password123',
				},
			}),
		);

		expect(resp.status).toBe(204);

		const setCookie = resp.headers.get('set-cookie');
		expect(setCookie).toContain('token=');
		expect(setCookie).toContain('Path=/');

		if (process.env.NODE_ENV === 'prod') {
			expect(setCookie).toContain('HttpOnly');
		}

		expect(login).toHaveBeenCalledTimes(1);
		expect(login).toHaveBeenCalledWith('user@test.com', 'password123');
	});

	it('POST /login -> returns 422 for invalid body', async () => {
		const resp = await createApp().handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'invalid-email',
				},
			}),
		);

		expect(resp.status).toBe(422);
	});
});
