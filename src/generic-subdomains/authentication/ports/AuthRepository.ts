export interface ClientAuthCredentials {
	id: number;
	role: string;
	email: string;
	passwordHash: string;
}

export interface FindClientByEmail {
	(email: string): Promise<ClientAuthCredentials | null>;
}

export interface AuthRepository {
	findClientByEmail: FindClientByEmail;
}
