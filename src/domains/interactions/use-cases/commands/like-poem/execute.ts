import type {
	CommandsRepository,
	LikePoemParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
	UsersContractForInteractions,
} from '../../../ports/ExternalServices';

import type { PoemLike } from '../../Models';
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	friendsServices: FriendsContractForInteractions;
	queriesRepository: QueriesRepository;
	usersContract: UsersContractForInteractions;
}

export function likePoemFactory({
	commandsRepository,
	queriesRepository,
	poemsContract,
	friendsServices,
	usersContract,
}: Dependencies) {
	return async function likePoem(params: LikePoemParams): Promise<PoemLike> {
		const { userId, poemId } = params;

		if (!Number.isInteger(userId) || userId <= 0) {
			throw new BadRequestError('Invalid user id');
		}

		if (!Number.isInteger(poemId) || poemId <= 0) {
			throw new BadRequestError('Invalid poem id');
		}

		const userInfo = await usersContract.getUserBasicInfo(userId);

		if (!userInfo.exists) throw new NotFoundError('User not found');
		if (userInfo.status !== 'active') {
			throw new ForbiddenError('Inactive users cannot like poems');
		}

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) throw new NotFoundError('Poem not found');

		const authorId = poemInfo.authorId;

		if (poemInfo.visibility === 'private' && authorId !== userId)
			throw new ForbiddenError('Cannot like this poem');

		if (poemInfo.visibility === 'friends' && authorId !== userId) {
			const areFriends = await friendsServices.areFriends(userId, authorId);
			if (!areFriends) {
				throw new ForbiddenError('Cannot like poems shared with friends only');
			}
		}

		const blockedByActor = await friendsServices.areBlocked(userId, authorId);
		const blockedByAuthor = await friendsServices.areBlocked(authorId, userId);

		if (blockedByActor || blockedByAuthor) {
			throw new ForbiddenError(
				'Cannot like poems while a blocking relationship exists',
			);
		}

		const alreadyLiked = await queriesRepository.existsPoemLike({
			userId,
			poemId,
		});

		if (alreadyLiked) throw new ConflictError('Poem already liked');

		return commandsRepository.createPoemLike({
			userId,
			poemId,
		});
	};
}
