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
import { usersContractForInteractions } from '@SharedKernel/contracts/users/Index';

export const queriesRouterServices: QueriesRouterServices = {
	getPoemComments: getPoemCommentsFactory({
		queriesRepository,
		poemsContract: poemsServicesForInteractions,
		friendsContract: friendsServicesForInteractions,
		usersContract: usersContractForInteractions,
	}),
};

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({
		commandsRepository,
		queriesRepository,
		poemsContract: poemsServicesForInteractions,
		friendsContract: friendsServicesForInteractions,
		usersContract: usersContractForInteractions,
	}),

	unlikePoem: unlikePoemFactory({
		commandsRepository,
		poemsContract: poemsServicesForInteractions,
		usersContract: usersContractForInteractions,
		queriesRepository,
	}),

	commentPoem: commentPoemFactory({
		commandsRepository,
		poemsContract: poemsServicesForInteractions,
		usersContract: usersContractForInteractions,
		friendsContract: friendsServicesForInteractions,
	}),

	deleteComment: deleteCommentFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersContractForInteractions,
	}),
};

export const interactionsQueriesRouter = createInteractionsQueriesRouter(
	queriesRouterServices,
);

export const interactionsCommandsRouter = createInteractionsCommandsRouter(
	commandsRouterServices,
);
