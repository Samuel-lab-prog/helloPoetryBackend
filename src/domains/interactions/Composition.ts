import { poemsPublicContract } from '@Domains/poems-management/public/Index';
import { friendsPublicContract } from '@Domains/friends-management/public/Index';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import { eventBus } from '@SharedKernel/events/EventBus';

import { getPoemCommentsFactory } from './use-cases/queries/Index';
import {
	commentPoemFactory,
	deleteCommentFactory,
	likePoemFactory,
	unlikePoemFactory,
} from './use-cases/commands/Index';
import { unlikeCommentFactory } from './use-cases/commands/unlike-comment/execute';

import { commandsRepository } from './infra/commands-repository/Repository';
import { queriesRepository } from './infra/queries-repository/Repository';
import type { CommandsRouterServices } from './ports/Commands';
import type { QueriesRouterServices } from './ports/Queries';
import { createInteractionsQueriesRouter } from './adapters/QueriesRouter';
import { createInteractionsCommandsRouter } from './adapters/CommandsRouter';
import { likeCommentFactory } from './use-cases/commands/like-comment/execute';
import { updateCommentFactory } from './use-cases/commands/update-comment/execute';

const queriesRouterServices: QueriesRouterServices = {
	getPoemComments: getPoemCommentsFactory({
		queriesRepository,
		poemsContract: poemsPublicContract,
		friendsContract: friendsPublicContract,
		usersContract: usersPublicContract,
	}),
};

const commandsRouterServices: CommandsRouterServices = {
	patchComment: updateCommentFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	likePoem: likePoemFactory({
		commandsRepository,
		queriesRepository,
		poemsContract: poemsPublicContract,
		friendsContract: friendsPublicContract,
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
		friendsContract: friendsPublicContract,
		eventBus: eventBus,
	}),

	deleteComment: deleteCommentFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),

	likeComment: likeCommentFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	unlikeComment: unlikeCommentFactory({
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
