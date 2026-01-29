import { queriesRepository } from '../../../infra/read-repository/repository';

import {
	getUserFactory,
	getPublicProfileFactory,
	getPrivateProfileFactory,
	getUsersFactory,
} from '../../../use-cases/queries/Index';

import type {
	FullUser,
	PrivateProfile,
	PublicProfile,
	UserRole,
	SelectUsersPage,
} from '../../../use-cases/queries/models/Index';

export interface UsersQueriesRouterServices {
	getUser: (params: {
		targetId: number;
		requesterId: number;
		requesterRole: UserRole;
	}) => Promise<FullUser>;
	getPublicProfile: (
		id: number,
		requesterId?: number,
	) => Promise<PublicProfile>;
	getPrivateProfile: (id: number) => Promise<PrivateProfile>;
	getUsers: (params: {
		navigationOptions: {
			limit?: number;
			cursor?: number;
		};
		sortOptions: {
			orderBy: 'createdAt' | 'nickname' | 'id';
			orderDirection: 'asc' | 'desc';
		};
		nicknameSearch?: string;
	}) => Promise<SelectUsersPage>;
}

export const usersQueriesServices: UsersQueriesRouterServices = {
	getUser: getUserFactory({ queriesRepository: queriesRepository }),
	getPublicProfile: getPublicProfileFactory({
		queriesRepository: queriesRepository,
	}),
	getPrivateProfile: getPrivateProfileFactory({
		queriesRepository: queriesRepository,
	}),
	getUsers: getUsersFactory({
		queriesRepository: queriesRepository,
	}),
};
