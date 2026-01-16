import type {
	userRole,
	userStatus,
} from '@Domains/users-management/use-cases/queries/read-models/Enums';
import type {
	poemStatus,
	poemVisibility,
} from '../../queries/read-models/Enums';

type ViewerContext = {
	id?: number;
	role?: userRole;
	status?: userStatus;
};

type AuthorContext = {
	friendIds?: number[];
	id: number;
};

type PoemContext = {
	id: number;
	authorId: number;
	status: poemStatus;
	visibility: poemVisibility;
};

export type PoemPolicyContext = {
	viewer: ViewerContext;
	author: AuthorContext;
	poem: PoemContext;
};

export function canViewPoem(c: PoemPolicyContext): boolean {
	const { viewer, author, poem } = c;

	if (viewer.role === 'moderator') return true;

	if (viewer.id === author.id) return true;

	if (poem.status !== 'published') {
		return false;
	}

	// Visitante
	if (!viewer.id) {
		return poem.visibility === 'public' || poem.visibility === 'unlisted';
	}

	switch (poem.visibility) {
		case 'public':
		case 'unlisted':
			return true;

		case 'private':
			return false;

		case 'friends':
			return author.friendIds?.includes(viewer.id) ?? false;

		default:
			return false;
	}
}
