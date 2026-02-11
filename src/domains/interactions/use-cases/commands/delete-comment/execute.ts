import type {
	CommandsRepository,
	DeleteCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { CommentNotFoundError, NotCommentOwnerError } from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function deleteCommentFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteComment(
		params: DeleteCommentParams,
	): Promise<void> {
		const { userId, commentId } = params;

		const comment = await queriesRepository.selectCommentById({
			commentId,
		});
		if (!comment) throw new CommentNotFoundError();

		const isOwner = comment.userId === userId;
		if (!isOwner) throw new NotCommentOwnerError();

		return commandsRepository.deletePoemComment({
			commentId,
		});
	};
}
