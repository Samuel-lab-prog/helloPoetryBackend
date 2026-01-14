import type { PrivateProfile } from '../use-cases/queries/read-models/PrivateProfile';
import type { PublicProfile } from '../use-cases/queries/read-models/PublicProfile';
import type { ClientAuthCredentials } from '../use-cases/queries/read-models/ClientAuth';
import type { FullUser } from '../use-cases/queries/read-models/FullUser';
import type { SelectUsersPage } from '../use-cases/queries/read-models/UsersPage';
import type { userStatus } from '../use-cases/queries/read-models/Enums';

export interface userQueriesRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;
	selectAuthUserByEmail(email: string): Promise<ClientAuthCredentials | null>;
	selectPublicProfile(
		id: number,
		requesterId?: number,
	): Promise<PublicProfile | null>;
	selectPrivateProfile(id: number): Promise<PrivateProfile | null>;
	selectUsers(params: SelectUsersParams): Promise<SelectUsersPage>;
}

export type NavigationOptions = {
	cursor?: number;
	limit: number;
};

export type FilterOptions = {
	searchNickname?: string;
	status?: userStatus;
};

export type SortOptions = {
	orderBy: 'nickname' | 'createdAt' | 'id';
	orderDirection: 'asc' | 'desc';
};

export interface SelectUsersParams {
	navigationOptions: NavigationOptions;
	filterOptions: FilterOptions;
	sortOptions: SortOptions;
}
