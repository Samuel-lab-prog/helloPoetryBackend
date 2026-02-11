import type { ClientAuthCredentials } from '../use-cases/Models';

export interface AuthRepository {
	findClientByEmail: (email: string) => Promise<ClientAuthCredentials | null>;
}
