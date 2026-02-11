import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';

import { poemsServicesForInteractions } from '@SharedKernel/contracts/poems/Index';
import { friendsServicesForInteractions } from '@SharedKernel/contracts/friends/Index';

import { getPoemCommentsFactory } from './use-cases/queries/Index';

import {
	commentPoemFactory,
	deleteCommentFactory,
	likePoemFactory,
	unlikePoemFactory,
} from './use-cases/commands/Index';

import type { CommandsRouterServices } from './ports/Commands';
import type { QueriesRouterServices } from './ports/Queries';
import { createInteractionsQueriesRouter } from './adapters/QueriesRouter';
import { createInteractionsCommandsRouter } from './adapters/CommandsRouter';

export const queriesRouterServices: QueriesRouterServices = {
	getPoemComments: getPoemCommentsFactory({
		queriesRepository,
		poemsContract: poemsServicesForInteractions,
	}),
};

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({
		commandsRepository,
		queriesRepository,
		poemsContract: poemsServicesForInteractions,
		friendsServices: friendsServicesForInteractions,
	}),

	unlikePoem: unlikePoemFactory({
		commandsRepository,
		poemsContract: poemsServicesForInteractions,
	}),

	commentPoem: commentPoemFactory({
		commandsRepository,
		poemsContract: poemsServicesForInteractions,
	}),

	deleteComment: deleteCommentFactory({
		commandsRepository,
		queriesRepository,
	}),
};

export const interactionsQueriesRouter = createInteractionsQueriesRouter(
	queriesRouterServices,
);

export const interactionsCommandsRouter = createInteractionsCommandsRouter(
	commandsRouterServices,
);
