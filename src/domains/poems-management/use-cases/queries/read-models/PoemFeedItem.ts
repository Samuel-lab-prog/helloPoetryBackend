export type PoemFeedItem = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	createdAt: Date;

	author: {
		id: number;
		nickname: string;
		avatarUrl?: string;
	};

	stats: {
		likesCount: number;
		commentsCount: number;
	};

	viewerContext: {
		hasLiked: boolean;
		canComment: boolean;
		isAuthorFriend: boolean;
	};
};
