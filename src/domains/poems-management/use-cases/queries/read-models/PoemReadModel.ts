import type { poemVisibility, poemStatus, poemModerationStatus } from './Enums';

export type PoemReadModel = {
	id: number;
	slug: string;
	title: string;
	content: string;
	excerpt: string | null;

	createdAt: Date;
	updatedAt: Date;

	visibility: poemVisibility;
	status: poemStatus;
	moderationStatus: poemModerationStatus;

	author: {
		id: number;
		nickname: string;
		avatarUrl?: string;
		isFriend: boolean;
	};

	dedications: {
		toUser?: {
			id: number;
			nickname: string;
		};
		toPoem?: {
			id: number;
			slug: string;
			title: string;
		};
	};

	stats: {
		likesCount: number;
		commentsCount: number;
	};

	viewerContext: {
		hasLiked: boolean;
		canComment: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
};
