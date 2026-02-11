import type {
	CommandsRepository,
	LikePoemParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type {
	FriendsContractForInteractions,
	PoemsContractForInteractions,
} from '../../../ports/ExternalServices';

import type { PoemLike } from '../../Models';
import {
	PoemNotFoundError,
	AlreadyLikedError,
	PrivatePoemError,
	FriendsOnlyPoemError,
	UserBlockedError,
} from '../../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	poemsContract: PoemsContractForInteractions;
	friendsServices: FriendsContractForInteractions;
	queriesRepository: QueriesRepository;
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

		if (!poemInfo.exists) throw new PoemNotFoundError();

		const authorId = poemInfo.authorId;

		if (poemInfo.visibility === 'private' && authorId !== userId)
			throw new PrivatePoemError();

		if (poemInfo.visibility === 'friends' && authorId !== userId) {
			const areFriends = await friendsServices.areFriends(userId, authorId);
			if (!areFriends) throw new FriendsOnlyPoemError();
		}

		const blocked = await friendsServices.areBlocked(userId, authorId);

		if (blocked) throw new UserBlockedError();

		const alreadyLiked = await queriesRepository.existsPoemLike({
			userId,
			poemId,
		});

		if (alreadyLiked) throw new AlreadyLikedError();

		return commandsRepository.createPoemLike({
			userId,
			poemId,
		});
	};
}
