import type { MockedContract } from '@TestUtils';
import type { FriendsContractForInteractions } from '../../ports/ExternalServices';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsPublicContract>;
	usersContract: MockedContract<UsersPublicContract>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};
