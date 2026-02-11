import type {
	PoemsContractForRecomendationEngine,
	FriendsContractForRecomendationEngine,
} from '../../../ports/ExternalServices';
import type { FeedItem } from '../../Models';
import type { GetFeedParams } from '../../../ports/Queries';

interface Dependencies {
	poemsServices: PoemsContractForRecomendationEngine;
	friendsServices: FriendsContractForRecomendationEngine;
}

export function getFeedFactory({
	poemsServices,
	friendsServices,
}: Dependencies) {
	return async function getFeed(params: GetFeedParams): Promise<FeedItem[]> {
		const { userId } = params;

		const FEED_LIMIT = 20;

		const friendsIds = await friendsServices.getFollowedUserIds(userId);
		const blockedIds = await friendsServices.getBlockedUserIds(userId);

		const feedAuthorIds = friendsIds.filter((id) => !blockedIds.includes(id));

		const { poems: friendPoems } = await poemsServices.getPoemsByAuthorIds({
			authorIds: feedAuthorIds,
			limit: 50,
		});

		const sortedFriendPoems = friendPoems.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);

		let selectedPoemIds = sortedFriendPoems
			.slice(0, FEED_LIMIT)
			.map((poem) => poem.id);

		if (selectedPoemIds.length < FEED_LIMIT) {
			const remaining = FEED_LIMIT - selectedPoemIds.length;

			const { poems: publicPoems } = await poemsServices.getPublicPoems({
				limit: remaining * 2,
			});

			const publicIds = publicPoems
				.map((p) => p.id)
				.filter((id) => !selectedPoemIds.includes(id));

			selectedPoemIds = [...selectedPoemIds, ...publicIds.slice(0, remaining)];
		}

		const { poems: finalFeedItems } = await poemsServices.getPoemsByIds({
			ids: selectedPoemIds,
		});

		return finalFeedItems;
	};
}
