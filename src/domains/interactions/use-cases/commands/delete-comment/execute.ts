import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import { CommentNotFoundError, NotCommentOwnerError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export interface DeleteCommentParams {
	userId: number;
	commentId: number;
}

export function deleteCommentFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteComment(
		params: DeleteCommentParams,
	): Promise<void> {
		const { userId, commentId } = params;
		const comment = await queriesRepository.selectCommentById({ commentId });

		if (!comment) {
			throw new CommentNotFoundError();
		}

		if (comment.userId !== userId) {
			throw new NotCommentOwnerError();
		}

		await commandsRepository.deletePoemComment({ commentId });
	};
}
