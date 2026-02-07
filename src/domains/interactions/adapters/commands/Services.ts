import { commandsRepository } from '../../infra/commands-repository/Repository';
import { queriesRepository } from '../../infra/queries-repository/Repository';
import type { PoemLike, PoemComment } from '../../use-cases/Models';
import {
	likePoemFactory,
	unlikePoemFactory,
	commentPoemFactory,
	deleteCommentFactory,
	type LikePoemParams,
	type UnlikePoemParams,
	type CommentPoemParams,
	type DeleteCommentParams,
} from '../../use-cases/commands/Index';
import { poemsServicesForInteractions } from '@SharedKernel/contracts/poems/Index';
import { friendsServicesForInteractions } from '@SharedKernel/contracts/friends/Index';

export interface CommandsRouterServices {
	likePoem(params: LikePoemParams): Promise<PoemLike>;
	unlikePoem(params: UnlikePoemParams): Promise<PoemLike>;
	commentPoem(params: CommentPoemParams): Promise<PoemComment>;
	deleteComment(params: DeleteCommentParams): Promise<void>;
}

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({
		commandsRepository,
		poemsContract: poemsServicesForInteractions,
		friendsServices: friendsServicesForInteractions,
		queriesRepository,
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
