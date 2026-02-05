import type {
	UserPrivateProfile,
	UserPublicProfile,
	FullUser,
	AuthUser,
	UsersPage,
} from '../use-cases/Models';

export interface QueriesRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;
	selectAuthUserByEmail(email: string): Promise<AuthUser | null>;
	selectPublicProfile(
		id: number,
		requesterId?: number,
	): Promise<UserPublicProfile | null>;
	selectPrivateProfile(id: number): Promise<UserPrivateProfile | null>;
	selectUsers(params: SelectUsersParams): Promise<UsersPage>;
}

export type SelectUsersParams = {
	navigationOptions: NavigationOptions;
	filterOptions: FilterOptions;
	sortOptions: SortOptions;
};

type NavigationOptions = {
	cursor?: number;
	limit: number;
};

type FilterOptions = {
	searchNickname?: string;
};

type SortOptions = {
	orderBy: 'nickname' | 'createdAt' | 'id';
	orderDirection: 'asc' | 'desc';
};
