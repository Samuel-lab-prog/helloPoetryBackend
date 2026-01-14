/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-await */
import { describe, it, expect, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { createAuthPlugin } from './AuthPlugin';

const PREFIX = 'http://test';

function createApp(authenticate: (token: string) => Promise<any>) {
	return new Elysia()
		.use(createAuthPlugin({ authenticate }))
		.get('/protected', ({ auth }: { auth: any }) => auth);
}

describe('AuthPlugin', () => {
	it('authenticates client and populates store', async () => {
		const authenticate = mock(async (token: string) => {
			expect(token).toBe('valid-token');
			return {
				id: 1,
				role: 'user',
			};
		});

		const app = createApp(authenticate);

		const resp = await app.handle(
			new Request(`${PREFIX}/protected`, {
				headers: {
					Cookie: 'token=valid-token',
				},
			}),
		);

		expect(resp.status).toBe(200);

		const body = await resp.json();

		expect(body.clientId).toBe(1);
		expect(body.clientRole).toBe('user');

		expect(authenticate).toHaveBeenCalledTimes(1);
	});

	it('returns error when authenticate throws', async () => {
		const authenticate = mock(async () => {
			throw new Error('invalid token');
		});

		const app = createApp(authenticate);

		const resp = await app.handle(
			new Request(`${PREFIX}/protected`, {
				headers: {
					Cookie: 'token=invalid-token',
				},
			}),
		);

		expect(resp.status).toBeGreaterThanOrEqual(400);
	});

	it('returns error when token cookie is missing', async () => {
		const authenticate = mock(async () => ({
			id: 1,
			role: 'user',
		}));

		const app = createApp(authenticate);

		const resp = await app.handle(new Request(`${PREFIX}/protected`));

		expect(resp.status).toBeGreaterThanOrEqual(400);
		expect(authenticate).not.toHaveBeenCalled();
	});

	it('executes finally block even when authentication fails', async () => {
		const authenticate = mock(async () => {
			throw new Error('boom');
		});

		const app = new Elysia()
			.use(createAuthPlugin({ authenticate }))
			.get('/protected', () => 'ok');

		const resp = await app.handle(
			new Request(`${PREFIX}/protected`, {
				headers: {
					Cookie: 'token=any-token',
				},
			}),
		);

		expect(resp.status).toBeGreaterThanOrEqual(400);
		expect(authenticate).toHaveBeenCalledTimes(1);
	});

	it('does not leak store values between requests', async () => {
		const authenticate = mock(async () => ({
			id: 42,
			role: 'admin',
		}));

		const app = createApp(authenticate);

		const resp1 = await app.handle(
			new Request(`${PREFIX}/protected`, {
				headers: { Cookie: 'token=one' },
			}),
		);

		const body1 = await resp1.json();

		const resp2 = await app.handle(
			new Request(`${PREFIX}/protected`, {
				headers: { Cookie: 'token=two' },
			}),
		);

		const body2 = await resp2.json();

		expect(body1.clientId).toBe(42);
		expect(body2.clientId).toBe(42);
	});
});
