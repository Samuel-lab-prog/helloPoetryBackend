import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export type AuthClient = {
	id: number;
	role: UserRole;
	status: UserStatus;
};

export type LoginResponse = {
	token: string;
	client: AuthClient;
};

export type ClientAuthCredentials = {
	id: number;
	role: UserRole;
	email: string;
	status: UserStatus;
	passwordHash: string;
};
