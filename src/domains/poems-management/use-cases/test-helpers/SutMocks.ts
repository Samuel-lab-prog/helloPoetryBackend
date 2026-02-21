import { mock } from 'bun:test';
import { type MockedContract, createMockedContract } from '@TestUtils';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type { CommandsRepository } from '../../ports/Commands';
import type { QueriesRepository } from '../../ports/Queries';
import type { SlugService } from '../../ports/ExternalServices';
import { createPoemFactory } from '../commands/create-poem/execute';
import { updatePoemFactory } from '../commands/update-poem/execute';
import { getAuthorPoemsFactory } from '../queries/get-author-poems/execute';
import { getMyPoemsFactory } from '../queries/get-my-poems/execute';
import { getPoemFactory } from '../queries/get-poem-by-id/execute';
import { deletePoemFactory } from '../commands/delete-poem/execute';

export type PoemsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
	slugService: MockedContract<SlugService>;
};

export function poemsMockFactories() {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			insertPoem: mock(),
			updatePoem: mock(),
			deletePoem: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectMyPoems: mock(),
			selectAuthorPoems: mock(),
			selectPoemById: mock(),
		}),
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),
		slugService: createMockedContract<SlugService>({
			generateSlug: mock(),
		}),
	};
}

type PoemsDeps = ReturnType<typeof poemsMockFactories>;

export function poemsFactory(deps: PoemsDeps) {
	return {
		createPoem: createPoemFactory({
			commandsRepository: deps.commandsRepository,
			usersContract: deps.usersContract,
			slugService: deps.slugService,
		}),
		updatePoem: updatePoemFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
			slugService: deps.slugService,
		}),
		getAuthorPoems: getAuthorPoemsFactory({
			poemQueriesRepository: deps.queriesRepository,
		}),
		getMyPoems: getMyPoemsFactory({
			poemQueriesRepository: deps.queriesRepository,
		}),
		getPoemById: getPoemFactory({
			poemQueriesRepository: deps.queriesRepository,
		}),
		deletePoem: deletePoemFactory({
			commandsRepository: deps.commandsRepository,
			usersContract: deps.usersContract,
		}),
	};
}
