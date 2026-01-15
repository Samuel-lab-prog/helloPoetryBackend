import type {
	userRole,
	userStatus,
} from '@Domains/users-management/use-cases/queries/read-models/Enums';
import type {
	poemStatus,
	poemVisibility,
} from '../../queries/read-models/Enums';

export type PoemPolicyContext = {
	requesterId?: number;
	requesterRole?: userRole;
	requesterStatus?: userStatus;

	authorId: number;
	poemStatus: poemStatus;
	poemVisibility: poemVisibility;

	isFriend?: boolean;
};

export function canCreatePoem(c: {
	requesterId: number;
	requesterStatus: userStatus;
}): boolean {
	return c.requesterStatus === 'active';
}

export function canDedicatePoemToUser(c: {
	targetUserExists: boolean;
	targetUserStatus: userStatus;
}): boolean {
	return c.targetUserExists && c.targetUserStatus === 'active';
}

export function canSaveDraft(c: {
	requesterId: number;
	authorId: number;
}): boolean {
	return c.requesterId === c.authorId;
}

export function canSchedulePoem(c: {
	requesterId: number;
	authorId: number;
}): boolean {
	return c.requesterId === c.authorId;
}

export function canReschedulePoem(c: {
	requesterId: number;
	authorId: number;
	poemStatus: poemStatus;
}): boolean {
	return c.requesterId === c.authorId && c.poemStatus === 'scheduled';
}

export function canMentionEntities(c: {
	poemStatus: poemStatus;
	requesterId: number;
	authorId: number;
}): boolean {
	return (
		c.requesterId === c.authorId &&
		(c.poemStatus === 'draft' || c.poemStatus === 'scheduled')
	);
}

export function canEditPoem(c: {
	requesterId: number;
	authorId: number;
	poemStatus: poemStatus;
}): boolean {
	return (
		c.requesterId === c.authorId &&
		(c.poemStatus === 'draft' || c.poemStatus === 'scheduled')
	);
}

export function canDeletePoem(c: {
	requesterId: number;
	requesterRole?: userRole;
	authorId: number;
}): boolean {
	return c.requesterId === c.authorId || c.requesterRole === 'moderator';
}

export function canViewPoem(c: PoemPolicyContext): boolean {
	if (c.requesterId === c.authorId) return true;

	if (!c.requesterId) {
		return c.poemVisibility === 'public' || c.poemVisibility === 'unlisted';
	}

	if (c.requesterRole === 'moderator') return true;

	switch (c.poemVisibility) {
		case 'public':
		case 'unlisted':
			return true;

		case 'private':
			return false;

		case 'friends':
			return c.isFriend === true;

		default:
			return false;
	}
}

export function canAppearInPublicFeed(c: {
	poemStatus: poemStatus;
	poemVisibility: poemVisibility;
}): boolean {
	return c.poemStatus === 'published' && c.poemVisibility === 'public';
}
