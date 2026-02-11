import type {
	UserPrivateProfile,
	UserPublicProfile,
	UsersPage,
	FullUser,
	AuthUser,
	UserStatus,
	UserRole,
} from '../use-cases/Models';

export type GetPrivateProfileParams = {
	requesterId: number;
	requesterStatus: UserStatus;
};

export type GetUsersParams = {
	requesterStatus: UserStatus;
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
	filterOptions: {
		searchNickname?: string;
	};
	sortOptions: {
		by: OrderBy;
		order: OrderDirection;
	};
};

export type GetPublicProfileParams = {
	id: number;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export interface UsersQueriesRouterServices {
	getPublicProfile: (
		params: GetPublicProfileParams,
	) => Promise<UserPublicProfile>;
	getPrivateProfile: (
		params: GetPrivateProfileParams,
	) => Promise<UserPrivateProfile>;
	getUsers: (params: GetUsersParams) => Promise<UsersPage>;
}

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

type NavigationOptions = { cursor?: number; limit: number };
type FilterOptions = { searchNickname?: string };
type OrderBy = Extract<'createdAt' | 'nickname' | 'id', keyof FullUser>;
type OrderDirection = 'asc' | 'desc';
type SortOptions = {
	orderBy: OrderBy;
	orderDirection: OrderDirection;
};
