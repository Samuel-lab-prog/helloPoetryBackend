/* eslint-disable require-await */
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { createUsersCommandsRouter } from './Router';

mock.module('@AuthPlugin', () => {
	return {
		AuthPlugin: new Elysia().decorate('auth', {
			clientId: 7,
			clientRole: 'user',
			clientStatus: 'active',
		}),
	};
});

function createApp() {
	return new Elysia().use(
		createUsersCommandsRouter({
			createUser: async (_data) => ({ id: 1 }),
			updateUser: async (requesterId, targetId, _data) => ({ id: targetId }),
		}),
	);
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

const PREFIX = 'http://test/users';

beforeEach(() => {});

describe('UsersCommandsRouter', () => {
	it('POST /users -> should create a new user', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}`, {
				method: 'POST',
				body: {
					email: 'hello@example.com',
					nickname: 'hello',
					name: 'Hello there',
					password: 'securepassword',
					bio: 'I am new here!',
					avatarUrl: 'http://example.com/avatar.png',
				},
			}),
		);
		expect(resp.status).toBe(201);
		const respBody = await resp.json();
		expect(respBody).toEqual({ id: 1 });
	});
	it('POST/users -> should reject invalid body fields', async () => {
		const app = createApp();
		const resp = await app.handle(
			jsonRequest(`${PREFIX}`, {
				method: 'POST',
				body: {
					email: 'not-an-email',
					nickname: '',
				},
			}),
		);
		expect(resp.status).toBe(422);
	});
	it('PATCH /users/:id -> should update user data', async () => {
		const app = createApp();
		const resp = await app.handle(
			jsonRequest(`${PREFIX}/5`, {
				method: 'PATCH',
				body: {
					name: 'Updated Name',
					bio: 'Updated bio',
					avatarUrl: 'http://example.com/new_avatar.png',
				},
			}),
		);
		expect(resp.status).toBe(200);
		const respBody = await resp.json();
		expect(respBody).toEqual({ id: 5 });
	});
});
