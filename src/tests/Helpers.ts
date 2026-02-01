import { Elysia } from 'elysia';
import { server } from '../index';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { prisma } from '@Prisma/PrismaClient';

export const app = new Elysia().use(server);
export const PREFIX = 'http://test/api/v1';

export interface TestUser {
	id: number;
	cookie: string;
	email: string;
	password: string;
}

export function jsonRequest(
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

/**
 * Create a user via API
 */
export async function createUser(data: {
	email: string;
	password: string;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string;
}): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	const body = (await res.json()) as any;
	return {
		id: body.id,
		cookie: '',
		email: data.email,
		password: data.password,
	};
}

/**
 * Log in a user and return the HTTP cookie
 */
export async function loginUser(user: TestUser): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/auth/login`, {
			method: 'POST',
			body: { email: user.email, password: user.password },
		}),
	);
	const cookie = res.headers.get('set-cookie');
	return { ...user, cookie: cookie || '' };
}

type ToUpdate = {
	role: UserRole;
	status: UserStatus;
};
export async function updateUserStats(
	userId: number,
	updates: Partial<ToUpdate>,
) {
	await prisma.user.update({
		where: { id: userId },
		data: updates,
	});
}
