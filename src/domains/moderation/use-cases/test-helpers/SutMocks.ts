import { mock } from 'bun:test';
import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/TestUtils';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import type { UsersServicesForModeration } from '../../ports/externalServices';
import { banUserFactory, suspendUserFactory } from '../commands/Index';

export type ModerationSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersServicesForModeration>;
};

export function moderationMockFactories(): ModerationSutMocks {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createBan: mock(),
			createSuspension: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectActiveBanByUserId: mock(),
			selectActiveSuspensionByUserId: mock(),
		}),
		usersContract: createMockedContract<UsersServicesForModeration>({
			selectUserBasicInfo: mock(),
		}),
	};
}

type ModerationDeps = ModerationSutMocks;

export function moderationFactory(deps: ModerationDeps) {
	return {
		banUser: banUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		suspendUser: suspendUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
	};
}
