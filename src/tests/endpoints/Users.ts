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
import { PREFIX, app } from '../Helpers.ts';
import { jsonRequest } from '../TestsUtils.ts';
import { prisma } from '@Prisma/PrismaClient.ts';
import type { AppError } from '@AppError';

export async function getMyPrivateProfile(
	cookie: string,
): Promise<UserPrivateProfile | AppError> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users/me`, {
			method: 'GET',
			headers: { Cookie: cookie },
		}),
	);
	const parsed = await res.json();

	if (!res.ok) return parsed as AppError;
	return parsed as UserPrivateProfile;
}

export async function getUserPublicProfile(
	cookie: string,
	targetUserId: number,
): Promise<UserPublicProfile | AppError> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users/${targetUserId}`, {
			method: 'GET',
			headers: { Cookie: cookie },
		}),
	);
	const parsed = await res.json();

	if (!res.ok) return parsed as AppError;
	return parsed as UserPublicProfile;
}

export async function createUser(
	data: CreateUser,
): Promise<CreateUserResult | AppError> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	const parsed = await res.json();

	if (!res.ok) return parsed as AppError;
	return parsed as CreateUserResult;
}

export async function updateUserProfile(
	cookie: string,
	updates: UpdateUserData,
): Promise<UpdateUserResult | AppError> {
	const res = await app.handle(
		jsonRequest(`${PREFIX}/users`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
			body: updates,
		}),
	);
	const parsed = await res.json();

	if (!res.ok) return parsed as AppError;
	return parsed as UpdateUserResult;
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
