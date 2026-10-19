import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { ErrorPlugin } from '@GenericSubdomains/utils/error-handling/error-plugin/util';
import { createCsrfPlugin } from '@GenericSubdomains/utils/security/csrfPlugin';
import { createUsersCommandsRouter } from './CommandsRouter';
import type { UsersCommandsServices } from '../ports/commands';

const createdAt = new Date('2025-01-01T00:00:00.000Z');
const createdUser = {
	id: 21,
	nickname: 'new_poet',
	name: 'New Poet',
	email: 'new-poet@example.test',
	bio: '',
	avatarUrl: null,
	role: 'author' as const,
	status: 'active' as const,
	createdAt,
	updatedAt: createdAt,
	emailVerifiedAt: null,
};

describe('INTEGRATION - public registration CSRF', () => {
	const createUser = mock(() => Promise.resolve(createdUser));
	const usersRouter = createUsersCommandsRouter({
		createUser,
		updateUser: () => Promise.resolve(createdUser),
		requestAvatarUploadUrl: () =>
			Promise.resolve({ uploadUrl: '', avatarUrl: '' }),
	} as unknown as UsersCommandsServices);
	const app = new Elysia({ prefix: '/api/v1' })
		.use(
			createCsrfPlugin({
				isEnabled: () => true,
				isOriginAllowed: (origin) => origin === 'http://trusted.example',
				shouldSkip: () => false,
			}),
		)
		.use(ErrorPlugin)
		.use(usersRouter);

	const registrationRequest = (headers: Record<string, string> = {}) =>
		new Request('http://localhost/api/v1/users/', {
			method: 'POST',
			headers: {
				origin: 'http://trusted.example',
				'content-type': 'application/json',
				...headers,
			},
			body: JSON.stringify({
				name: 'New Poet',
				nickname: 'new_poet',
				email: 'new-poet@example.test',
				password: 'password-123',
				bio: '',
			}),
		});

	beforeEach(() => createUser.mockClear());

	it('rejects public registration without CSRF and does not call the service', async () => {
		const response = await app.handle(registrationRequest());

		expect(response.status).toBe(403);
		expect(createUser).not.toHaveBeenCalled();
	});

	it('allows public registration with matching cookie and header tokens', async () => {
		const response = await app.handle(
			registrationRequest({
				cookie: 'csrf_token=valid-token',
				'x-csrf-token': 'valid-token',
			}),
		);

		expect(response.status).toBe(201);
		expect(createUser).toHaveBeenCalledTimes(1);
	});
});
