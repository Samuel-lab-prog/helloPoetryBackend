import type { userRole } from './Enums';

export type UserPreview = {
	id: string;
	nickname: string;
	avatarUrl: string | null;
	role: userRole;
};
