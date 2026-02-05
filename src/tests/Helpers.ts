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
import type { CreateUser } from '@Domains/users-management/use-cases/Models';
import { usersData } from './TestsData';
import { jsonRequest } from './TestsUtils.ts';

export const app = new Elysia().use(server);
export const PREFIX = 'http://test/api/v1';

export interface TestUser {
	id: number;
	cookie: string;
	email: string;
	password: string;
}

/**
 * Creates a new user in the system via the HTTP API.
 * @param data The data for the new user.
 * @returns A promise that resolves to the created TestUser.
 */
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

/**
 * Logs in a user and updates their cookie.
 * @param user The user to log in.
 * @returns The logged-in user with an updated cookie.
 *
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

/**
 * Updates a user's statistics in the database. Useful for setting up test scenarios.
 * @param userId The ID of the user to update.
 * @param updates An object containing the fields to update.
 */
export async function updateUserStatsRaw(
	userId: number,
	updates: Partial<{ role: UserRole; status: UserStatus }>,
) {
	await prisma.user.update({
		where: { id: userId },
		data: updates,
	});
}

/**
 * Creates a friendship relation between two users in the database. Useful for validating test scenarios.
 * @param requesterId The ID of the user who sent the friend request.
 * @param addresseeId The ID of the user who received the friend request.
 */
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

/**
 * Updates a poem's attributes in the database. Useful for setting up test scenarios.
 * @param poemId - The ID of the poem to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated poem with selected fields.
 */
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

/**
 * Sets up 3 test users by creating and logging them in.
 * @returns A promise that resolves to an array of logged-in test users.
 */
export async function setupHttpUsers(): Promise<TestUser[]> {
	const userPromises = usersData.map((data) => createUser(data));
	let users = await Promise.all(userPromises);

	const loginPromises = users.map((user) => loginUser(user));
	users = await Promise.all(loginPromises);

	return users;
}
