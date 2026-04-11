import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { AuthClientSchema } from './schemas/Index';

export type AuthClient = (typeof AuthClientSchema)['static'];

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
