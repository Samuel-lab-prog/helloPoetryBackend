import type { PoemStatus, PoemVisibility, PoemModerationStatus } from './Enums';

export interface FullPoem {
	id: number;
	slug: string;
	title: string;
	content: string;
	excerpt?: string;
	isCommentable: boolean;
	createdAt: Date;
	updatedAt: Date;

	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;

	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
		friendsIds: number[];
	};

	dedicatedToUser?: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
	} | null;

	dedicatedToPoem?: {
		id: number;
		title: string;
		slug: string;
		authorId: number;
	} | null;

	tags: { id: number; name: string }[];

	stats: {
		likesCount: number;
		commentsCount: number;
	};
}
