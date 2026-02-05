import type { UsersContract } from '@SharedKernel/contracts/users/Index';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

import type { QueriesRepository } from '../../../ports/QueriesRepository';

import {
	InvalidDedicatedUsersError,
	PoemCreationDeniedError,
	PoemNotFoundError,
	PoemUpdateDeniedError,
} from '../Errors';

type AuthorContext = {
	status: UserStatus;
	id: number;
	role: UserRole;
};

type PoemPolicyContext = {
	author: AuthorContext;
};

export type PoemCreationPolicyParams = {
	ctx: PoemPolicyContext;
	usersContract: UsersContract;
	toUserIds?: number[];
};

export type PoemUpdatePolicyParams = PoemCreationPolicyParams & {
	poemId: number;
	queriesRepository: QueriesRepository;
};

export async function validateDedicatedUsers(
	usersContract: UsersContract,
	requesterId: number,
	userIds?: number[],
): Promise<boolean> {
	const ids = Array.isArray(userIds) ? userIds.map(Number) : [];

	if (ids.length === 0) return true;

	if (ids.includes(requesterId)) {
		throw new PoemUpdateDeniedError(
			'Author cannot dedicate poem to themselves',
		);
	}

	const users = await Promise.all(
		ids.map((id) => usersContract.getUserBasicInfo(id).catch(() => null)),
	);

	const invalidUser = users.find((u) => !u || u.status !== 'active');

	if (invalidUser) return false;

	return true;
}

export async function canCreatePoem(
	params: PoemCreationPolicyParams,
): Promise<void> {
	const { ctx, usersContract, toUserIds } = params;
	const { author } = ctx;

	if (author.status !== 'active') {
		throw new PoemCreationDeniedError('Author is not active');
	}

	const areIdsValid = await validateDedicatedUsers(
		usersContract,
		author.id,
		toUserIds,
	);
	if (!areIdsValid) {
		throw new InvalidDedicatedUsersError();
	}
}

export async function canUpdatePoem(
	params: PoemUpdatePolicyParams,
): Promise<void> {
	const { ctx, usersContract, toUserIds, poemId } = params;
	const { author } = ctx;

	if (author.status !== 'active') {
		throw new PoemUpdateDeniedError('Author is not active');
	}

	const existingPoem = await params.queriesRepository.selectPoemById(poemId);

	if (!existingPoem) {
		throw new PoemNotFoundError();
	}

	if (existingPoem.author.id !== author.id) {
		throw new PoemUpdateDeniedError('User is not the author of the poem');
	}

	if (existingPoem.status === 'published') {
		throw new PoemUpdateDeniedError('Cannot update a published poem');
	}

	if (existingPoem.moderationStatus === 'removed') {
		throw new PoemUpdateDeniedError('Cannot update a removed poem');
	}

	await validateDedicatedUsers(usersContract, author.id, toUserIds);
}
