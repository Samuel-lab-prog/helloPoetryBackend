import { Elysia } from 'elysia';
import { describe, it, expect } from 'bun:test';
import { server } from '../../../../index.ts';

const PREFIX = 'http://localhost/api/v1/auth';

function createApp() {
	return new Elysia().use(server);
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
	it('POST /login -> Should login a client successfully', async () => {
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

	it('POST /login -> Should fail to login with wrong password', async () => {
		const resp = await createApp().handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'normaluser@gmail.com',
					password: 'wrongpassword',
				},
			}),
		);
		expect(resp.status).toBe(401);
	});

	it('POST /login -> Should fail to login with non-existing email', async () => {
		const resp = await createApp().handle(
			jsonRequest(`${PREFIX}/login`, {
				method: 'POST',
				body: {
					email: 'nonexistinguser@gmail.com',
					password: 'somepassword',
				},
			}),
		);
		expect(resp.status).toBe(401);
	});
});
