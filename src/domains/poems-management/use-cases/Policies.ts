import type { UsersServicesForPoems } from '../ports/UsersServices';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

import type { QueriesRepository } from '../ports/QueriesRepository';

import {
	InvalidDedicatedUsersError,
	PoemCreationDeniedError,
	PoemNotFoundError,
	PoemUpdateDeniedError,
} from './Errors';

import type {
	PoemStatus,
	PoemVisibility,
	PoemModerationStatus,
} from './Models';

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
	usersContract: UsersServicesForPoems;
	toUserIds?: number[];
};

export type PoemUpdatePolicyParams = PoemCreationPolicyParams & {
	poemId: number;
	queriesRepository: QueriesRepository;
};

export async function validateDedicatedUsers(
	usersContract: UsersServicesForPoems,
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

	// 1. Author
	if (isViewerOwnAuthor) return true;

	// 2. Ban
	if (isViewerBanned) return false;

	// 3. Moderation
	if (!isPoemApproved) return false;

	// 4. Draft
	if (isPoemDraft) return false;

	// 5. Moderator
	if (isViewerModerator && !isPoemPrivate) return true;

	// 6. Visibility
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
