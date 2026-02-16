import type { MockedContract } from '@TestUtils';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';

export type NotificationsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
};
