import type { MockedContract } from '@TestUtils';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import { type EventBus } from '@SharedKernel/events/EventBus';

export type InteractionsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	poemsContract: MockedContract<PoemsPublicContract>;
	usersContract: MockedContract<UsersPublicContract>;
	friendsContract: MockedContract<FriendsPublicContract>;
	eventBus: EventBus
};
