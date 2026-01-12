import { prisma } from '../../../../prisma/myClient';
import { withPrismaErrorHandling } from '@AppError';

import type {
	UserCommandsRepository,
	UserQueriesRepository,
	UserAuthReadRepository,
} from '../../ports/repository';
import type { InsertUser, UpdateUserData } from '../../commands/commandsModels';
import type { FullUser, ClientAuthCredentials } from '../../queries/ReadModels';

const fullUserSelect = {
	id: true,
	nickname: true,
	email: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	emailVerifiedAt: true,
} as const satisfies Record<keyof FullUser, boolean>;

const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
} as const satisfies Record<keyof ClientAuthCredentials, boolean>;

function insertUser(user: InsertUser): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.create({
			data: user,
			select: fullUserSelect,
		});
	});
}

function softDeleteUser(id: number): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
			select: fullUserSelect,
		});
	});
}

function updateUser(
	userId: number,
	userData: UpdateUserData,
): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.update({
			where: { id: userId },
			data: userData,
			select: fullUserSelect,
		});
	});
}

function selectUserById(id: number): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { id },
			select: fullUserSelect,
		});
	});
}

function selectUserByNickname(nickname: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { nickname },
			select: fullUserSelect,
		});
	});
}

function selectUserByEmail(email: string): Promise<FullUser | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: fullUserSelect,
		});
	});
}

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	return withPrismaErrorHandling(() => {
		return prisma.user.findUnique({
			where: { email },
			select: authUserSelect,
		});
	});
}

export const QueriesRepository: UserQueriesRepository = {
	selectUserById,
	selectUserByNickname,
	selectUserByEmail,
};

export const CommandsRepository: UserCommandsRepository = {
	insertUser,
	softDeleteUser,
	updateUser,
};

export const AuthReadRepository: UserAuthReadRepository = {
	selectAuthUserByEmail,
};
