import { describe, expect, it } from 'bun:test';
import { createUsersReadRouter } from './QueriesRouter';
import type { UsersQueriesRouterServices } from '../ports/queries';

const router = createUsersReadRouter({
	getProfile: () =>
		Promise.reject(new Error('Not used by availability tests.')),
	searchUsers: () =>
		Promise.reject(new Error('Not used by availability tests.')),
	checkNickanmeAvailability: (nickname: string) =>
		Promise.resolve(nickname === 'taken_name'),
	checkEmailAvailability: (email: string) =>
		Promise.resolve(email === 'taken@example.test'),
} as unknown as UsersQueriesRouterServices);

describe('UNIT - Users availability endpoints', () => {
	it('returns nickname availability as a JSON boolean', async () => {
		const response = await router.handle(
			new Request('http://localhost/users/check-nickname?nickname=taken_name'),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toBe(true);
	});

	it('returns email availability as a JSON boolean', async () => {
		const response = await router.handle(
			new Request(
				'http://localhost/users/check-email?email=taken%40example.test',
			),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toBe(true);
	});
});
