import type {
	CommandsRepository,
	CommentPoemParams,
} from '../../../ports/Commands';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
	UsersContractForInteractions,
} from '../../../ports/ExternalServices';
import type { PoemComment } from '../../Models';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';

export interface CommentPoemDependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	usersContract: UsersContractForInteractions;
	friendsContract: FriendsContractForInteractions;
}

export function commentPoemFactory({
	commandsRepository,
	poemsContract,
	usersContract,
	friendsContract,
}: CommentPoemDependencies) {
	return async function commentPoem(
		params: CommentPoemParams,
	): Promise<PoemComment> {
		const { userId, poemId, content } = params;

		const trimmedContent = content?.trim();

		if (!trimmedContent)
			throw new UnprocessableEntityError('Comment content cannot be empty');

		if (trimmedContent.length > 300)
			throw new UnprocessableEntityError(
				'Comment content cannot exceed 300 characters',
			);

		const userInfo = await usersContract.getUserBasicInfo(userId);
		if (!userInfo.exists) throw new NotFoundError('User not found');

		if (userInfo.status !== 'active')
			throw new ForbiddenError('Inactive users cannot comment on poems');

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new NotFoundError('Poem not found');

		if (poemInfo.moderationStatus !== 'approved')
			throw new ForbiddenError('Cannot comment on this poem');

		const authorId = poemInfo.authorId;

		if (await friendsContract.areBlocked(userId, authorId))
			throw new ForbiddenError(
				'Cannot comment while a blocking relationship exists',
			);

		if (poemInfo.visibility === 'private')
			throw new ForbiddenError('Cannot comment on this poem');

		if (poemInfo.visibility === 'friends' && authorId !== userId) {
			const areFriends = await friendsContract.areFriends(userId, authorId);
			if (!areFriends)
				throw new ForbiddenError(
					'Cannot comment on poems shared with friends only',
				);
		}

		return commandsRepository.createPoemComment({
			userId,
			poemId,
			content: trimmedContent,
		});
	};
}
