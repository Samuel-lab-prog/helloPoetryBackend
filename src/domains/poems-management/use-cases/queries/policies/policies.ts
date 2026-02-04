import type { PoemStatus, PoemVisibility } from '../Models';
import type {
	PoemModerationStatus,
	UserRole,
	UserStatus,
} from '@SharedKernel/Enums';

type ViewerContext = {
	id?: number;
	role?: UserRole;
	status?: UserStatus;
};

type AuthorContext = {
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

export type PoemPolicyContext = {
	viewer: ViewerContext;
	author: AuthorContext;
	poem: PoemContext;
};

export function canViewPoem(c: PoemPolicyContext): boolean {
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
