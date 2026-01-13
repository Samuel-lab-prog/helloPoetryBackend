import type { UserPreview } from '../read-models/Preview';

export type SelectUsersPage = {
	users: UserPreview[];
	nextCursor?: number;
	hasMore: boolean;
};
