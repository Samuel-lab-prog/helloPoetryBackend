import { Elysia } from 'elysia';
import { server } from '../index';
import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
	UserRole,
	UserStatus,
} from '@SharedKernel/Enums';
import { prisma } from '@Prisma/PrismaClient';
import type { CreateUser } from '@Domains/users-management/use-cases/commands/Index';

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
): Request {
	return new Request(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
}

export async function createUser(data: CreateUser): Promise<TestUser> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	const body = (await res.json()) as { id: number };
	return {
		id: body.id,
		cookie: '',
		email: data.email,
		password: data.password,
	};
}

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

export async function updateUserStatsRaw(
	userId: number,
	updates: Partial<{ role: UserRole; status: UserStatus }>,
) {
	await prisma.user.update({
		where: { id: userId },
		data: updates,
	});
}

export async function createFriendshipRaw(
	requesterId: number,
	addresseeId: number,
) {
	await prisma.friendship.create({
		data: {
			userAId: requesterId,
			userBId: addresseeId,
		},
	});
}

export async function updatePoemRaw(
	poemId: number,
	updates: Partial<{
		visibility: PoemVisibility;
		status: PoemStatus;
		moderationStatus: PoemModerationStatus;
	}>,
) {
	return await prisma.poem.update({
		where: { id: poemId },
		data: updates,
		select: {
			id: true,
			moderationStatus: true,
			status: true,
			visibility: true,
		},
	});
}
