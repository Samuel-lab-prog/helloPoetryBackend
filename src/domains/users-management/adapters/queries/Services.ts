import { queriesRepository } from '../../infra/queries-repository/Repository';

import {
	getUserFactory,
	getPrivateProfileFactory,
	getPublicProfileFactory,
	getUsersFactory,
	type GetPrivateProfileParams,
	type GetPublicProfileParams,
	type GetUserParams,
	type GetUsersParams,
} from '../../use-cases/queries/Index';

import type {
	FullUser,
	UserPrivateProfile,
	UserPublicProfile,
	UsersPage,
} from '../../use-cases/Models';

export interface UsersQueriesRouterServices {
	getUser: (params: GetUserParams) => Promise<FullUser>;
	getPublicProfile: (
		params: GetPublicProfileParams,
	) => Promise<UserPublicProfile>;
	getPrivateProfile: (
		params: GetPrivateProfileParams,
	) => Promise<UserPrivateProfile>;
	getUsers: (params: GetUsersParams) => Promise<UsersPage>;
}

export const usersQueriesServices: UsersQRouterServices = {
	getUser: getUserFactory({
		queriesRepository: queriesRepository,
	}),
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
