import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { UsersPage, FullUser } from '../../Models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

type OrderBy = Extract<'createdAt' | 'nickname' | 'id', keyof FullUser>;
type OrderDirection = 'asc' | 'desc';

export type GetUsersParams = {
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
		const { navigationOptions, filterOptions, sortOptions } = params;

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
