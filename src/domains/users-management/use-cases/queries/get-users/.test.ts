import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { getUsersFactory } from './execute';

import type {
	QueriesRepository,
	NavigationOptions,
	SortOptions,
} from '../../../ports/QueriesRepository';

import type { SelectUsersPage } from './../index';

describe('getUsersFactory', () => {
	let queriesRepository: QueriesRepository;

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
		queriesRepository = {
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
		const getUsers = getUsersFactory({ queriesRepository });

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

		expect(queriesRepository.selectUsers).toHaveBeenCalledWith({
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
		const getUsers = getUsersFactory({ queriesRepository });

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

		expect(queriesRepository.selectUsers).toHaveBeenCalledWith({
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
		const getUsers = getUsersFactory({ queriesRepository });

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

		expect(queriesRepository.selectUsers).toHaveBeenCalledWith({
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
		queriesRepository.selectUsers = mock(() =>
			Promise.reject(new Error('db failure')),
		);

		const getUsers = getUsersFactory({ queriesRepository });

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
