import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export interface ClientAuthCredentials {
	id: number;
	role: UserRole;
	email: string;
	status: UserStatus;
	passwordHash: string;
}

export interface FindClientByEmail {
	(email: string): Promise<ClientAuthCredentials | null>;
}

export interface AuthRepository {
	findClientByEmail: FindClientByEmail;
}
