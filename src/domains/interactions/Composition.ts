import { poemsPublicContract } from '@Domains/poems-management/public/Index';
import { friendsContractForInteractions } from '@SharedKernel/contracts/friends/Index';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';

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
		poemsContract: poemsPublicContract,
		friendsContract: friendsContractForInteractions,
		usersContract: usersPublicContract,
	}),
};

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({
		commandsRepository,
		queriesRepository,
		poemsContract: poemsPublicContract,
		friendsContract: friendsContractForInteractions,
		usersContract: usersPublicContract,
	}),

	unlikePoem: unlikePoemFactory({
		commandsRepository,
		poemsContract: poemsPublicContract,
		usersContract: usersPublicContract,
		queriesRepository,
	}),

	commentPoem: commentPoemFactory({
		commandsRepository,
		poemsContract: poemsPublicContract,
		usersContract: usersPublicContract,
		friendsContract: friendsContractForInteractions,
	}),

	deleteComment: deleteCommentFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
};

export const interactionsQueriesRouter = createInteractionsQueriesRouter(
	queriesRouterServices,
);

export const interactionsCommandsRouter = createInteractionsCommandsRouter(
	commandsRouterServices,
);
