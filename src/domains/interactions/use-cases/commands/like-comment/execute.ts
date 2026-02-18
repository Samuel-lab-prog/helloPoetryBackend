import type {
	CommandsRepository,
	LikeCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { ConflictError } from '@DomainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { eventBus } from '@SharedKernel/events/EventBus';

export interface LikeCommentDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function likeCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: LikeCommentDependencies) {
	return async function likeComment(params: LikeCommentParams): Promise<void> {
		const { userId, commentId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const alreadyLiked = await queriesRepository.selectCommentLike({
			userId,
			commentId,
		});
		if (alreadyLiked) throw new ConflictError('Comment already liked');

		eventBus.publish('COMMENT_LIKED', {
			userId,
			likerId: userId,
			likerNickname: userInfo.nickname,
			commentId,
		});

		await commandsRepository.createCommentLike({
			commentId,
			userId,
		});
	};
}
