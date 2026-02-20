import type { CreateUserParams, UpdateUserParams } from '../../ports/Commands';
import type {
	GetPrivateProfileParams,
	GetPublicProfileParams,
	GetUsersParams,
} from '../../ports/Queries';
import { makeParams, makeSut } from '@TestUtils';
import {
	givenCreateUserConflict,
	givenCreateUserFailure,
	givenHashedPassword,
	givenPrivateProfile,
	givenPrivateProfileNotFound,
	givenPublicProfile,
	givenPublicProfileNotFound,
	givenUpdateUserConflict,
	givenUpdateUserFailure,
	givenUserCreated,
	givenUserUpdated,
	givenUsersPage,
	type FullUserOverride,
	type PrivateProfileOverride,
	type PublicProfileOverride,
	type UsersPageOverride,
} from './Givens';
import {
	DEFAULT_CREATE_USER_DATA,
	DEFAULT_PUBLIC_PROFILE_ID,
	DEFAULT_REQUESTER_ID,
	DEFAULT_REQUESTER_STATUS,
	DEFAULT_TARGET_ID,
	DEFAULT_UPDATE_USER_DATA,
} from './Constants';
import {
	type UsersManagementSutMocks,
	usersManagementFactory,
	usersManagementMockFactories,
} from './SutMocks';

type GetUsersParamsOverride = Partial<
	Omit<GetUsersParams, 'navigationOptions' | 'filterOptions' | 'sortOptions'>
> & {
	navigationOptions?: Partial<GetUsersParams['navigationOptions']>;
	filterOptions?: Partial<GetUsersParams['filterOptions']>;
	sortOptions?: Partial<GetUsersParams['sortOptions']>;
};

type UpdateUserParamsOverride = Partial<Omit<UpdateUserParams, 'data'>> & {
	data?: Partial<UpdateUserParams['data']>;
};

// eslint-disable-next-line max-lines-per-function
export function makeUsersManagementScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		usersManagementFactory,
		usersManagementMockFactories(),
	);

	return {
		withHashedPassword(hash: string = 'hashed_password') {
			givenHashedPassword(mocks.hashServices, hash);
			return this;
		},

		withUserCreated(overrides: FullUserOverride = {}) {
			givenUserCreated(mocks.commandsRepository, overrides);
			return this;
		},

		withUserUpdated(overrides: FullUserOverride = {}) {
			givenUserUpdated(mocks.commandsRepository, overrides);
			return this;
		},

		withCreateConflict(message: string) {
			givenCreateUserConflict(mocks.commandsRepository, message);
			return this;
		},

		withUpdateConflict(message: string) {
			givenUpdateUserConflict(mocks.commandsRepository, message);
			return this;
		},

		withCreateFailure() {
			givenCreateUserFailure(mocks.commandsRepository);
			return this;
		},

		withUpdateFailure() {
			givenUpdateUserFailure(mocks.commandsRepository);
			return this;
		},

		withPrivateProfile(overrides: PrivateProfileOverride = {}) {
			givenPrivateProfile(mocks.queriesRepository, overrides);
			return this;
		},

		withPrivateProfileNotFound() {
			givenPrivateProfileNotFound(mocks.queriesRepository);
			return this;
		},

		withPublicProfile(overrides: PublicProfileOverride = {}) {
			givenPublicProfile(mocks.queriesRepository, overrides);
			return this;
		},

		withPublicProfileNotFound() {
			givenPublicProfileNotFound(mocks.queriesRepository);
			return this;
		},

		withUsersPage(overrides: UsersPageOverride = {}) {
			givenUsersPage(mocks.queriesRepository, overrides);
			return this;
		},

		executeCreateUser(data: Partial<CreateUserParams['data']> = {}) {
			return sutFactory.createUser({
				data: makeParams(DEFAULT_CREATE_USER_DATA, data),
			});
		},

		executeUpdateUser(params: UpdateUserParamsOverride = {}) {
			return sutFactory.updateUser(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_REQUESTER_STATUS,
						targetId: DEFAULT_TARGET_ID,
						data: DEFAULT_UPDATE_USER_DATA,
					},
					{
						...params,
						data: makeParams(DEFAULT_UPDATE_USER_DATA, params.data),
					},
				),
			);
		},

		executeGetPrivateProfile(params: Partial<GetPrivateProfileParams> = {}) {
			return sutFactory.getPrivateProfile(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_REQUESTER_STATUS,
					},
					params,
				),
			);
		},

		executeGetPublicProfile(params: Partial<GetPublicProfileParams> = {}) {
			return sutFactory.getPublicProfile(
				makeParams(
					{
						id: DEFAULT_PUBLIC_PROFILE_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'author',
						requesterStatus: DEFAULT_REQUESTER_STATUS,
					},
					params,
				),
			);
		},

		executeGetUsers(params: GetUsersParamsOverride = {}) {
			return sutFactory.getUsers({
				requesterStatus: params.requesterStatus ?? DEFAULT_REQUESTER_STATUS,
				navigationOptions: makeParams({}, params.navigationOptions),
				filterOptions: makeParams({}, params.filterOptions),
				sortOptions: makeParams({ by: 'id', order: 'asc' }, params.sortOptions),
			});
		},

		get mocks(): UsersManagementSutMocks {
			return mocks;
		},
	};
}
