import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { UserCreateInput, UserUpdateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/Types';

import type {
	AdminBootstrapRepository,
	CommandsRepository,
} from '../../ports/commands';
import type {
	UpdateUserData,
	CreateUserDB,
	FullUser,
} from '../../ports/models';
import { fullUserSelect } from '../queries-repository/selects';

function toPrismaCreateInput(user: CreateUserDB): UserCreateInput {
	return {
		nickname: user.nickname,
		email: user.email,
		passwordHash: user.passwordHash,
		name: user.name,
		bio: user.bio,
		...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
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

async function insertUser(
	user: CreateUserDB,
): Promise<CommandResult<FullUser>> {
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

const findExistingAdmin: AdminBootstrapRepository['findExistingAdmin'] =
	async () => {
		const admin = await prisma.user.findFirst({
			where: { role: 'admin', deletedAt: null },
			select: { id: true },
		});
		return admin !== null;
	};

const findUserByEmail: AdminBootstrapRepository['findUserByEmail'] = (email) =>
	prisma.user.findUnique({
		where: { email },
		select: { id: true, nickname: true },
	});

const findUserByNickname: AdminBootstrapRepository['findUserByNickname'] = (
	nickname,
) =>
	prisma.user.findUnique({
		where: { nickname },
		select: { id: true },
	});

const updateUserAsAdmin: AdminBootstrapRepository['updateUserAsAdmin'] = (
	userId,
	profile,
) =>
	prisma.user.update({
		where: { id: userId },
		data: {
			role: 'admin',
			passwordHash: profile.passwordHash,
			name: profile.name,
			nickname: profile.nickname,
			bio: profile.bio,
			...(profile.avatarUrl !== undefined
				? { avatarUrl: profile.avatarUrl }
				: {}),
		},
		select: fullUserSelect,
	});

const createAdmin: AdminBootstrapRepository['createAdmin'] = (profile) =>
	prisma.user.create({
		data: {
			email: profile.email,
			passwordHash: profile.passwordHash,
			name: profile.name,
			nickname: profile.nickname,
			bio: profile.bio,
			avatarUrl: profile.avatarUrl ?? null,
			role: 'admin',
		},
		select: fullUserSelect,
	});

export const adminBootstrapRepository: AdminBootstrapRepository = {
	findExistingAdmin,
	findUserByEmail,
	findUserByNickname,
	updateUserAsAdmin,
	createAdmin,
};
