import type { userRole } from './Enums';

export type UserPreview = {
	id: number;
	nickname: string;
	avatarUrl: string;
	role: userRole;
};
