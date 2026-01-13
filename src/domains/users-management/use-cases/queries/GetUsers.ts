import type {
	UserReadRepository,
	SortOptions,
	NavigationOptions,
} from '../../ports/QueriesRepository';
import type { SelectUsersPage } from './read-models/index';

interface Dependencies {
	userReadRepository: UserReadRepository;
}

interface GetUsersParams {
	navigationOptions: NavigationOptions;
	sortOptions: SortOptions;
	nicknameSearch?: string;
}

export function getUsersFactory({ userReadRepository }: Dependencies) {
	return function getUsers(params: GetUsersParams): Promise<SelectUsersPage> {
		return userReadRepository.selectUsers({
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
