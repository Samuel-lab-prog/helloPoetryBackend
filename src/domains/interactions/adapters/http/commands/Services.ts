import { commandsRepository } from '../../../infra/commands-repository/Repository';
import { queriesRepository } from '../../../infra/queries-repository/Repository';
import type {
	PoemLike,
	PoemComment,
} from '../../../use-cases/commands/models/Index';
import {
	likePoemFactory,
	unlikePoemFactory,
	commentPoemFactory,
	deleteCommentFactory,
} from '../../../use-cases/commands/Index';
import { poemsContract } from '@SharedKernel/contracts/poems/Index';

export interface CommandsRouterServices {
	likePoem(params: { userId: number; poemId: number }): Promise<PoemLike>;
	unlikePoem(params: { userId: number; poemId: number }): Promise<PoemLike>;
	commentPoem(params: {
		userId: number;
		poemId: number;
		content: string;
	}): Promise<PoemComment>;
	deleteComment(params: { userId: number; commentId: number }): Promise<void>;
}

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({ commandsRepository, poemsContract }),
	unlikePoem: unlikePoemFactory({ commandsRepository, poemsContract }),
	commentPoem: commentPoemFactory({ commandsRepository, poemsContract }),
	deleteComment: deleteCommentFactory({
		commandsRepository,
		queriesRepository,
	}),
};
