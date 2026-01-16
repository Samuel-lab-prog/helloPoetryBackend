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
