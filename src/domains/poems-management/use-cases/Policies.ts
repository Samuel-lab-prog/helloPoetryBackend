import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type { QueriesRepository } from '../ports/Queries';

import type {
	PoemStatus,
	PoemVisibility,
	PoemModerationStatus,
} from './Models';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

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
	usersContract: UsersPublicContract;
	toUserIds?: number[];
};

export type PoemUpdatePolicyParams = PoemCreationPolicyParams & {
	poemId: number;
	queriesRepository: QueriesRepository;
};

export async function validateDedicatedUsers(
	usersContract: UsersPublicContract,
	requesterId: number,
	userIds?: number[],
): Promise<boolean> {
	const ids = Array.isArray(userIds) ? userIds.map(Number) : [];

	if (ids.length === 0) return true;

	if (ids.includes(requesterId))
		throw new ForbiddenError('Author cannot dedicate poem to themselves');

	const users = await Promise.all(
		ids.map((id) => usersContract.selectUserBasicInfo(id).catch(() => null)),
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

	if (author.status !== 'active')
		throw new ForbiddenError('Author is not active');

	const areIdsValid = await validateDedicatedUsers(
		usersContract,
		author.id,
		toUserIds,
	);
	if (!areIdsValid) {
		throw new UnprocessableEntityError('Invalid dedicated users');
	}
}

export async function canUpdatePoem(
	params: PoemUpdatePolicyParams,
): Promise<void> {
	const { ctx, usersContract, toUserIds, poemId } = params;
	const { author } = ctx;

	if (author.status !== 'active')
		throw new ForbiddenError('Author is not active');

	const existingPoem = await params.queriesRepository.selectPoemById(poemId);

	if (!existingPoem) throw new NotFoundError('Poem not found');

	if (existingPoem.author.id !== author.id)
		throw new ForbiddenError('User is not the author of the poem');

	if (existingPoem.status === 'published')
		throw new ForbiddenError('Cannot update a published poem');

	if (existingPoem.moderationStatus === 'removed')
		throw new ForbiddenError('Cannot update a removed poem');

	await validateDedicatedUsers(usersContract, author.id, toUserIds);
}

type ViewerContext = {
	id?: number;
	role?: UserRole;
	status?: UserStatus;
};

type AuthorContextForView = {
	friendIds?: number[];
	id: number;
	directAccess?: boolean;
};

type PoemContext = {
	id: number;
	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
};

export type PoemPolicyContextForView = {
	viewer: ViewerContext;
	author: AuthorContextForView;
	poem: PoemContext;
};

export function canViewPoem(c: PoemPolicyContextForView): boolean {
	const { viewer, author, poem } = c;

	const isViewerOwnAuthor = viewer.id === author.id;
	const isViewerBanned = viewer.status === 'banned';
	const isViewerModerator = viewer.role === 'moderator';

	const isPoemApproved = poem.moderationStatus === 'approved';
	const isPoemDraft = poem.status === 'draft';
	const isPoemPrivate = poem.visibility === 'private';

	const isDirectAccess = author.directAccess === true;

	function isFriend(): boolean {
		if (viewer.id === undefined) return false;
		return author.friendIds?.includes(viewer.id) === true;
	}

	if (isViewerOwnAuthor) return true;

	if (isViewerBanned) return false;

	if (!isPoemApproved) return false;

	if (isPoemDraft) return false;

	if (isViewerModerator && !isPoemPrivate) return true;

	switch (poem.visibility) {
		case 'public':
			return true;

		case 'unlisted':
			return isDirectAccess;

		case 'friends':
			return isFriend();

		case 'private':
			return false;

		default:
			return false;
	}
}
