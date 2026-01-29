import type {
	PrivateProfile,
	PublicProfile,
	FullUser,
	UserAuthCredentials,
	SelectUsersPage,
	UserStatus,
} from '../use-cases/queries/models/Index';

export interface QueriesRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;
	selectAuthUserByEmail(email: string): Promise<UserAuthCredentials | null>;
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
	status?: UserStatus;
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
