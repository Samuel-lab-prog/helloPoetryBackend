import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { QueriesRepository } from '../../../ports/QueriesRepository';
import type { FriendsContractForInteractions } from '../../../ports/FriendsServices';
import type { PoemsContractForInteractions } from '../../../ports/PoemServices';

import type { PoemLike } from '../models/Index';
import {
	PoemNotFoundError,
	AlreadyLikedError,
	PrivatePoemError,
	FriendsOnlyPoemError,
	UserBlockedError,
} from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	friendsServices: FriendsContractForInteractions;
	queriesRepository: QueriesRepository;
}

interface LikePoemParams {
	userId: number;
	poemId: number;
}

export function likePoemFactory({
	commandsRepository,
	queriesRepository,
	poemsContract,
	friendsServices,
}: Dependencies) {
	return async function likePoem(params: LikePoemParams): Promise<PoemLike> {
		const { userId, poemId } = params;

		const poemInfo = await poemsContract.getPoemInteractionInfo(poemId);

		if (!poemInfo.exists) {
			throw new PoemNotFoundError();
		}

		const authorId = poemInfo.authorId;

		// Visibility rules
		if (poemInfo.visibility === 'private' && authorId !== userId) {
			throw new PrivatePoemError();
		}

		if (poemInfo.visibility === 'friends' && authorId !== userId) {
			const areFriends = await friendsServices.areFriends(userId, authorId);

			if (!areFriends) {
				throw new FriendsOnlyPoemError();
			}
		}

		// Block rules
		const blocked = await friendsServices.areBlocked(userId, authorId);

		if (blocked) {
			throw new UserBlockedError();
		}

		// Like rules
		const alreadyLiked = await queriesRepository.existsPoemLike({
			userId,
			poemId,
		});

		if (alreadyLiked) {
			throw new AlreadyLikedError();
		}

		return commandsRepository.createPoemLike({
			userId,
			poemId,
		});
	};
}
