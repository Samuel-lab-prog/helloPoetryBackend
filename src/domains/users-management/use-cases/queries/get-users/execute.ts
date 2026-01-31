import type {
	QueriesRepository,
	SortOptions,
} from '../../../ports/QueriesRepository';
import type { SelectUsersPage } from '../models/UsersPage';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

interface GetUsersParams {
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
	sortOptions: SortOptions;
	nicknameSearch?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
export function getUsersFactory({ queriesRepository }: Dependencies) {
	return function getUsers(params: GetUsersParams): Promise<SelectUsersPage> {
		return queriesRepository.selectUsers({
			navigationOptions: {
				limit: Math.min(
					params.navigationOptions.limit ?? DEFAULT_LIMIT,
					MAX_LIMIT,
				),
				cursor: params.navigationOptions.cursor,
			},
			sortOptions: params.sortOptions,
			filterOptions: {
				status: 'active',
				searchNickname: params.nicknameSearch,
			},
		});
	};
}
