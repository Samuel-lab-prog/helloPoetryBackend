import { QueriesRepository } from '../../../infra/read-repository/repository';

import {
	getUserFactory,
	getPublicProfileFactory,
	getPrivateProfileFactory,
	getUsersFactory,
} from '../../../use-cases/queries/index';

import type {
	FullUser,
	PrivateProfile,
	PublicProfile,
	userRole,
	SelectUsersPage,
} from '../../../use-cases/queries/read-models/index';

export interface UsersQueriesRouterServices {
	getUser: (params: {
		targetId: number;
		requesterId: number;
		requesterRole: userRole;
	}) => Promise<FullUser>;
	getPublicProfile: (
		id: number,
		requesterId?: number,
	) => Promise<PublicProfile>;
	getPrivateProfile: (id: number) => Promise<PrivateProfile>;
	getUsers: (params: {
		navigationOptions: {
			limit: number;
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
	getUser: getUserFactory({ userQueriesRepository: QueriesRepository }),
	getPublicProfile: getPublicProfileFactory({
		userQueriesRepository: QueriesRepository,
	}),
	getPrivateProfile: getPrivateProfileFactory({
		userQueriesRepository: QueriesRepository,
	}),
	getUsers: getUsersFactory({
		userQueriesRepository: QueriesRepository,
	}),
};
