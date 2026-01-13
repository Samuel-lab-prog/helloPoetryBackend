import type { UserPreview } from './Preview';

export type SelectUsersPage = {
	users: UserPreview[];
	nextCursor?: number;
	hasMore: boolean;
};
