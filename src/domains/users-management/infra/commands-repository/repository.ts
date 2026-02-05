import { prisma } from '@PrismaClient';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/CommandsRepository';
import type {
	UpdateUserData,
	InsertUser,
} from '../../use-cases/commands/models/Index';
import type { FullUser } from '@Domains/users-management/use-cases/queries/Index';
import { fullUserSelect } from '../queries-repository/selects/FullUser';
import type { UserCreateInput, UserUpdateInput } from '@PrismaGenerated/models';

function toPrismaCreateInput(user: InsertUser): UserCreateInput {
	return {
		nickname: user.nickname,
		email: user.email,
		passwordHash: user.passwordHash,
		name: user.name,
		bio: user.bio,
		avatarUrl: user.avatarUrl,
	};
}

function toPrismaUpdateInput(data: UpdateUserData): UserUpdateInput {
	return {
		...(data.nickname !== undefined && { nickname: data.nickname }),
		...(data.name !== undefined && { name: data.name }),
		...(data.bio !== undefined && { bio: data.bio }),
		...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
	};
}

async function insertUser(user: InsertUser): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.create({
			data: toPrismaCreateInput(user),
			select: fullUserSelect,
		});
	});
}

async function updateUser(
	userId: number,
	userData: UpdateUserData,
): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.update({
			where: { id: userId, deletedAt: null },
			data: toPrismaUpdateInput(userData),
			select: fullUserSelect,
		});
	});
}

async function softDeleteUser(id: number): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.update({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
			select: fullUserSelect,
		});
	});
}

export const commandsRepository: CommandsRepository = {
	insertUser,
	updateUser,
	softDeleteUser,
};
