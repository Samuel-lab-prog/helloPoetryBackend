import type { MockedContract } from '@TestUtils';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';

export type FriendsManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
};
