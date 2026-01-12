// This import is necessary since the user-identity bounded context
// is downstream (conformist) from the authentication bounded context.
// This coupling is acceptable as the authentication context provides
// essential types for user identity management.
import type { ClientAuthCredentials } from '@GenericSubdomains/authentication/ports/AuthRepository';

import type { FullUser } from '../queries/ReadModels';
import type { InsertUser, UpdateUserData } from '../commands/commandsModels';

export interface UserQueriesRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;
}

export interface UserCommandsRepository {
	insertUser(user: InsertUser): Promise<FullUser | null>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<FullUser | null>;
	softDeleteUser(id: number): Promise<FullUser | null>;
}

// Repository for reading authentication-related user data
export interface UserAuthReadRepository {
	selectAuthUserByEmail(email: string): Promise<ClientAuthCredentials | null>;
}
