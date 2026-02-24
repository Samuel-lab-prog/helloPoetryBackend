import type {
	CommandsRepository,
	LikeCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { ConflictError } from '@GenericSubdomains/utils/domainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface UnlikeCommentDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function unlikeCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: UnlikeCommentDependencies) {
	return async function unlikeComment(
		params: LikeCommentParams,
	): Promise<void> {
		const { userId, commentId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const alreadyLiked = await queriesRepository.selectCommentLike({
			userId,
			commentId,
		});
		if (!alreadyLiked) throw new ConflictError('Comment not liked yet');

		await commandsRepository.deleteCommentLike({
			commentId,
			userId,
		});
	};
}
