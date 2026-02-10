import { Elysia } from 'elysia';
import { server } from '../index';
import { usersData } from './data/Users.ts';
import { jsonRequest, isAppError } from './TestsUtils.ts';
import type { AppError } from '@AppError';
import type { UserRole, UserStatus } from '@SharedKernel/Enums.ts';
import { createUser } from './endpoints/Users.ts';

export const app = new Elysia().use(server);
export const PREFIX = 'http://test/api/v1';
export type AuthUser = { cookie: string; id: number };

/**
 * Logs in a user and updates their cookie.
 * @param email - The email of the user to log in.
 * @param password - The password of the user to log in.
 * @returns Cookie and id.
 *
 */
export async function loginUser(
	email: string,
	password: string,
): Promise<AuthUser | AppError> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/auth/login`, {
			method: 'POST',
			body: { email, password },
		}),
	);

	const cookie = res.headers.get('set-cookie');
	const parsed = await res.json();

	if (!res.ok || !cookie) return parsed as AppError;
	const okResult = parsed as { id: number; role: UserRole; status: UserStatus };
	return { cookie, id: okResult.id };
}

/**
 * Sets up test users by creating and logging them in.
 * @returns A promise that resolves to an array of logged-in test users.
 */
export async function setupHttpUsers(): Promise<AuthUser[]> {
	const userPromises = usersData.map((data) => createUser(data));
	await Promise.all(userPromises);

	const loginPromises = usersData.map((data) =>
		loginUser(data.email, data.password),
	);
	const loginResults = await Promise.all(loginPromises);

	for (const result of loginResults) {
		if (isAppError(result))
			throw new Error(`Failed to set up users: ${result.message}`);

		if (!result || !result.cookie)
			throw new Error('Failed to set up users: Missing cookie');
	}

	return loginResults as AuthUser[];
}
