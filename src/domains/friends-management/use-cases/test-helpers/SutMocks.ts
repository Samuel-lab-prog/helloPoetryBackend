import type { MockedContract } from '@TestUtils';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type {
	FriendsContractForInteractions,
	UsersContractForInteractions,
} from '@Domains/interactions/ports/ExternalServices';

export type FriendsManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersContractForInteractions>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};
