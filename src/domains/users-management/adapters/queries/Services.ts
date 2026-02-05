import { queriesRepository } from '../../infra/queries-repository/Repository';

import {
	getPrivateProfileFactory,
	getPublicProfileFactory,
	getUsersFactory,
	type GetPrivateProfileParams,
	type GetPublicProfileParams,
	type GetUsersParams,
} from '../../use-cases/queries/Index';

import type {
	UserPrivateProfile,
	UserPublicProfile,
	UsersPage,
} from '../../use-cases/Models';

export interface UsersQueriesRouterServices {
	getPublicProfile: (
		params: GetPublicProfileParams,
	) => Promise<UserPublicProfile>;
	getPrivateProfile: (
		params: GetPrivateProfileParams,
	) => Promise<UserPrivateProfile>;
	getUsers: (params: GetUsersParams) => Promise<UsersPage>;
}

export const usersQueriesServices: UsersQueriesRouterServices = {
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
