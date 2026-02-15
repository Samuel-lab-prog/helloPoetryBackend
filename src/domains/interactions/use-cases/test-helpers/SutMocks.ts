import type { MockedContract } from '@TestUtils';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../../ports/ExternalServices';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsContractForInteractions>;
	usersContract: MockedContract<UsersPublicContract>;
	friendsContract: MockedContract<FriendsContractForInteractions>;
};
