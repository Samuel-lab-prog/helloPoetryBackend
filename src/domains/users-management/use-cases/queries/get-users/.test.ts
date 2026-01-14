import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getUsersFactory } from './execute';

import type {
	userQueriesRepository,
	NavigationOptions,
	SortOptions,
} from '../../../ports/QueriesRepository';

import type { SelectUsersPage } from './../index';

describe('getUsersFactory', () => {
	let userQueriesRepository: userQueriesRepository;

	const fakeResult: SelectUsersPage = {
		users: [
			{
				id: 1,
				nickname: 'samuel',
				avatarUrl: 'http://example.com/avatar1.png',
				role: 'user',
			},
		],
		nextCursor: 2,
		hasMore: true,
	};

	beforeEach(() => {
		userQueriesRepository = {
			selectPrivateProfile: mock(),
			selectPublicProfile: mock(),
			selectAuthUserByEmail: mock(),
			selectUserByEmail: mock(),
			selectUserById: mock(),
			selectUserByNickname: mock(),
			selectUsers: mock(() => Promise.resolve(fakeResult)),
		};
	});

	it('should call selectUsers with default limit when not provided', async () => {
		const getUsers = getUsersFactory({ userQueriesRepository });

		const navigationOptions: NavigationOptions = {
			cursor: undefined,
			limit: 10,
		};

		const sortOptions: SortOptions = {
			orderBy: 'createdAt',
			orderDirection: 'desc',
		};

		const result = await getUsers({
			navigationOptions,
			sortOptions,
		});

		expect(userQueriesRepository.selectUsers).toHaveBeenCalledWith({
			navigationOptions: {
				limit: 10,
				cursor: undefined,
			},
			sortOptions,
			filterOptions: {
				status: 'active',
				searchNickname: undefined,
			},
		});

		expect(result).toEqual(fakeResult);
	});

	it('should pass custom limit and cursor when provided', async () => {
		const getUsers = getUsersFactory({ userQueriesRepository });

		const navigationOptions: NavigationOptions = {
			limit: 10,
			cursor: 5,
		};

		const sortOptions: SortOptions = {
			orderBy: 'nickname',
			orderDirection: 'asc',
		};

		await getUsers({
			navigationOptions,
			sortOptions,
		});

		expect(userQueriesRepository.selectUsers).toHaveBeenCalledWith({
			navigationOptions: {
				limit: 10,
				cursor: 5,
			},
			sortOptions,
			filterOptions: {
				status: 'active',
				searchNickname: undefined,
			},
		});
	});

	it('should include nickname search when provided', async () => {
		const getUsers = getUsersFactory({ userQueriesRepository });

		await getUsers({
			navigationOptions: {
				limit: 10,
				cursor: undefined,
			},
			sortOptions: {
				orderBy: 'createdAt',
				orderDirection: 'desc',
			},
			nicknameSearch: 'sam',
		});

		expect(userQueriesRepository.selectUsers).toHaveBeenCalledWith({
			navigationOptions: {
				limit: 10,
				cursor: undefined,
			},
			sortOptions: {
				orderBy: 'createdAt',
				orderDirection: 'desc',
			},
			filterOptions: {
				status: 'active',
				searchNickname: 'sam',
			},
		});
	});

	it('should propagate repository errors', async () => {
		userQueriesRepository.selectUsers = mock(() =>
			Promise.reject(new Error('db failure')),
		);

		const getUsers = getUsersFactory({ userQueriesRepository });

		await expect(
			getUsers({
				navigationOptions: {
					limit: 20,
					cursor: undefined,
				},
				sortOptions: {
					orderBy: 'createdAt',
					orderDirection: 'desc',
				},
			}),
		).rejects.toThrow('db failure');
	});
});
