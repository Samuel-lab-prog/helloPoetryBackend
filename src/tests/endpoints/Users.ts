import type {
	CreateUser,
	CreateUserResult,
	UpdateUserData,
	UpdateUserResult,
	UserPrivateProfile,
	UserPublicProfile,
	UserRole,
	UserStatus,
} from '@Domains/users-management/use-cases/Models.ts';
import {
	jsonRequest,
	API_INSTANCE,
	API_PREFIX,
	handleResponse,
} from '@TestUtils';
import { prisma } from '@Prisma/PrismaClient.ts';
import type { AppError } from '@AppError';

export async function getMyPrivateProfile(
	cookie: string,
): Promise<UserPrivateProfile | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users/me`, {
			method: 'GET',
			headers: { Cookie: cookie },
		}),
	);
	return handleResponse<UserPrivateProfile>(res);
}

export async function getUserPublicProfile(
	cookie: string,
	targetUserId: number,
): Promise<UserPublicProfile | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users/${targetUserId}`, {
			method: 'GET',
			headers: { Cookie: cookie },
		}),
	);
	return handleResponse<UserPublicProfile>(res);
}

export async function createUser(
	data: CreateUser,
): Promise<CreateUserResult | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	return handleResponse<CreateUserResult>(res);
}

export async function updateUserProfile(
	cookie: string,
	updates: UpdateUserData,
): Promise<UpdateUserResult | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
			body: updates,
		}),
	);
	return handleResponse<UpdateUserResult>(res);
}

/**
 * Updates a user's role or status directly in the database. Useful for setting up test scenarios.
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
