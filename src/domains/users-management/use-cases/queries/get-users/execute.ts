import type { QueriesRepository } from '../../../ports/QueriesRepository';
import { UserBannedError } from '../../Errors';
import type { UsersPage, FullUser, UserStatus } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

type OrderBy = Extract<'createdAt' | 'nickname' | 'id', keyof FullUser>;
type OrderDirection = 'asc' | 'desc';

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

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getUsersFactory({ queriesRepository }: Dependencies) {
	return function getUsers(params: GetUsersParams): Promise<UsersPage> {
		const { navigationOptions, filterOptions, sortOptions, requesterStatus } =
			params;

		if (requesterStatus === 'banned') throw new UserBannedError();

		return queriesRepository.selectUsers({
			navigationOptions: {
				limit: Math.min(navigationOptions.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
				cursor: navigationOptions.cursor,
			},
			sortOptions: {
				orderBy: sortOptions.by,
				orderDirection: sortOptions.order,
			},
			filterOptions: {
				searchNickname: filterOptions.searchNickname,
			},
		});
	};
}
