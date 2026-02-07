import { describe, it, expect, mock } from 'bun:test';

import { getUsersFactory } from './execute';

import type { QueriesRepository } from '../../../ports/QueriesRepository';

import { UserBannedError } from '../../Errors';

describe('USE-CASE - Users Management', () => {
	const selectUsers = mock();

	const queriesRepository: QueriesRepository = {
		selectUsers,
		selectPublicProfile: mock(),
		selectPrivateProfile: mock(),
    selectAuthUserByEmail: mock(),
    selectUserByEmail: mock(),
    selectUserById: mock(),
    selectUserByNickname: mock(),
	};

	const getUsers: ReturnType<typeof getUsersFactory> = getUsersFactory({
		queriesRepository,
	});

	describe('Get Users', () => {
		it('Does not allow banned users to list users', () => {
			expect(() =>
				getUsers({
					requesterStatus: 'banned',
					navigationOptions: {},
					filterOptions: {},
					sortOptions: {
						by: 'id',
						order: 'asc',
					},
				}),
			).toThrow(UserBannedError);
		});

		it('Applies default limit when none is provided', async () => {
			selectUsers.mockResolvedValueOnce({
				items: [],
				nextCursor: null,
			});

			await getUsers({
				requesterStatus: 'active',
				navigationOptions: {},
				filterOptions: {},
				sortOptions: {
					by: 'id',
					order: 'asc',
				},
			});

			expect(selectUsers).toHaveBeenCalledWith({
				navigationOptions: {
					limit: 20,
					cursor: undefined,
				},
				sortOptions: {
					orderBy: 'id',
					orderDirection: 'asc',
				},
				filterOptions: {
					searchNickname: undefined,
				},
			});
		});

		it('Caps limit to the maximum allowed value', async () => {
			selectUsers.mockResolvedValueOnce({
				items: [],
				nextCursor: null,
			});

			await getUsers({
				requesterStatus: 'active',
				navigationOptions: {
					limit: 1000,
				},
				filterOptions: {},
				sortOptions: {
					by: 'nickname',
					order: 'desc',
				},
			});

			expect(selectUsers).toHaveBeenCalledWith({
				navigationOptions: {
					limit: 100,
					cursor: undefined,
				},
				sortOptions: {
					orderBy: 'nickname',
					orderDirection: 'desc',
				},
				filterOptions: {
					searchNickname: undefined,
				},
			});
		});

		it('Successfully returns a users page', async () => {
			const page = {
				items: [
					{ id: 1, nickname: 'john' },
					{ id: 2, nickname: 'mary' },
				],
				nextCursor: 2,
			};

			selectUsers.mockResolvedValueOnce(page);

			const result = await getUsers({
				requesterStatus: 'active',
				navigationOptions: {
					limit: 10,
				},
				filterOptions: {
					searchNickname: 'jo',
				},
				sortOptions: {
					by: 'createdAt',
					order: 'desc',
				},
			});

			expect(result).toHaveProperty('items');
		});
	});
});
