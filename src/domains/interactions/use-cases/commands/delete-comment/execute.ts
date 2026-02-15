import type {
	CommandsRepository,
	DeleteCommentParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

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

		const comment = await queriesRepository.selectCommentById({ commentId });
		v.ensure(comment, `Comment with id ${commentId} not found`)
			.notNull()
			.notUndefined();

		if (userInfo.role === 'author')
			v.compareIds(userId, comment!.userId).sameOwner();

		return commandsRepository.deletePoemComment({ commentId });
	};
}
