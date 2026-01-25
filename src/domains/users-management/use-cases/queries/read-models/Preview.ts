import type { UserRole } from './Enums';

export type UserPreview = {
	id: number;
	nickname: string;
	avatarUrl: string;
	role: UserRole;
};
