import { queriesRepository } from './infra/queries-repository/Repository';
import type { QueriesRouterServices } from './ports/Queries';
import { commandsRepository } from './infra/commands-repository/Repository';
import { slugifyService } from './infra/slug-service/Execute';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
} from './use-cases/queries';
import { createPoemsQueriesRouter } from './adapters/QueriesRouter';

import {
	createPoemFactory,
	updatePoemFactory,
} from './use-cases/commands/Index';

import type { CommandsRouterServices } from './ports/Commands';
import { createPoemsCommandsRouter } from './adapters/CommandsRouter';

const commandsRouterServices: CommandsRouterServices = {
	createPoem: createPoemFactory({
		commandsRepository,
		slugService: slugifyService,
		usersContract: usersPublicContract,
	}),
	updatePoem: updatePoemFactory({
		commandsRepository,
		queriesRepository,
		slugService: slugifyService,
		usersContract: usersPublicContract,
	}),
};

const queriesRouterServices: QueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getPoemById: getPoemFactory({
		poemQueriesRepository: queriesRepository,
	}),
};

export const poemsQueriesRouter = createPoemsQueriesRouter(
	queriesRouterServices,
);

export const poemsCommandsRouter = createPoemsCommandsRouter(
	commandsRouterServices,
);
