import type {
	userQueriesRepository,
	SortOptions,
	NavigationOptions,
} from '../../../ports/QueriesRepository';
import type { SelectUsersPage } from './../read-models/UsersPage';

interface Dependencies {
	userQueriesRepository: userQueriesRepository;
}

interface GetUsersParams {
	navigationOptions: NavigationOptions;
	sortOptions: SortOptions;
	nicknameSearch?: string;
}

export function getUsersFactory({ userQueriesRepository }: Dependencies) {
	return function getUsers(params: GetUsersParams): Promise<SelectUsersPage> {
		return userQueriesRepository.selectUsers({
			navigationOptions: {
				limit: params.navigationOptions.limit ?? 20,
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
