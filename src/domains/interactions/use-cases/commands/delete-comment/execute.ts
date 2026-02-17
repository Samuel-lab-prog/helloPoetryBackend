import type {
	CommandsRepository,
	DeleteCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { CommentStatus } from '@Domains/interactions/ports/Models';

export interface DeleteCommentDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function deleteCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: DeleteCommentDependencies) {
	return async function deleteComment(
		params: DeleteCommentParams,
	): Promise<void> {
		const { userId, commentId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const rawComment = await queriesRepository.selectCommentById({ commentId });

		const comment = v
			.comment(rawComment)
			.withStatus(['visible'], 'Comment is already deleted');

		let deletedBy: CommentStatus = 'deletedByModerator';
		if (userInfo.role === 'author') {
			v.sameOwner(userId, comment.userId);
			deletedBy = 'deletedByAuthor';
		}

		await commandsRepository.deletePoemComment({ commentId, deletedBy });
	};
}
