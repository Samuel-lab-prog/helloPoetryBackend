import type { UserPreview } from './UserPreview';

export type SelectUsersPage = {
	users: UserPreview[];
	nextCursor?: number;
	hasMore: boolean;
};
