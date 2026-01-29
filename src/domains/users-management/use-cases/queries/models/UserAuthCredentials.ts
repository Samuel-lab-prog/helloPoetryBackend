import type { UserStatus, UserRole } from './Enums';

export type UserAuthCredentials = {
	id: number;
	role: UserRole;
	email: string;
	passwordHash: string;
	status: UserStatus;
};
