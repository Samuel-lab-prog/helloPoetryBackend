import type { FeedItem } from '../../../ports/Models';
import type { GetFeedParams } from '../../../ports/Queries';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsFeedContract } from '@Domains/feed-engine/ports/ExternalServices';

interface Dependencies {
	poemsServices: PoemsFeedContract;
	friendsServices: FriendsPublicContract;
}

export function getFeedFactory({
	poemsServices,
	friendsServices,
}: Dependencies) {
	return async function getFeed(params: GetFeedParams): Promise<FeedItem[]> {
		const { userId } = params;

		const FEED_LIMIT = 20;

		const [friendsIds, blockedIds] = await Promise.all([
			friendsServices.selectFollowedUserIds(userId),
			friendsServices.selectBlockedUserIds(userId),
		]);

		const blockedSet = new Set(blockedIds);

		const feedAuthorIds = friendsIds.filter((id) => !blockedSet.has(id));

		const friendPoems = await poemsServices.getFeedPoemsByAuthorIds({
			authorIds: feedAuthorIds,
			limit: FEED_LIMIT,
		});

		const selected: FeedItem[] = [...friendPoems];

		if (selected.length < FEED_LIMIT) {
			const remaining = FEED_LIMIT - selected.length;

			const publicPoems = await poemsServices.getPublicFeedPoems({
				limit: remaining,
				excludeAuthorIds: [...blockedSet],
				excludePoemIds: selected.map((p) => p.id),
			});

			selected.push(...publicPoems);
		}

		return selected;
	};
}
