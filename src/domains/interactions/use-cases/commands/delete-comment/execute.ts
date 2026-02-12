import type {
	CommandsRepository,
	DeleteCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { UsersContractForInteractions } from '../../../ports/ExternalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersContractForInteractions;
}

export function deleteCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function deleteComment(
		params: DeleteCommentParams,
	): Promise<void> {
		const { userId, commentId } = params;

		const userInfo = await usersContract.getUserBasicInfo(userId);
		if (!userInfo.exists) throw new NotFoundError('User not found');
		if (userInfo.status !== 'active')
			throw new ForbiddenError('Inactive users cannot delete comments');

		const comment = await queriesRepository.selectCommentById({
			commentId,
		});

		if (!comment) throw new NotFoundError('Comment not found');

		const isOwner = comment.userId === userId;
		if (!isOwner) throw new ForbiddenError('Only comment owners can delete it');

		return commandsRepository.deletePoemComment({
			commentId,
		});
	};
}
