import type { MockedContract } from '@TestUtils';
import type {
	UsersContractForInteractions,
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../../ports/ExternalServices';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsContractForInteractions>;
	usersContract: MockedContract<UsersContractForInteractions>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};
