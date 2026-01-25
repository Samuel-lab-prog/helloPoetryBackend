import type { PoemVisibility, PoemStatus, PoemModerationStatus } from './Enums';

export type MyPoem = {
	id: number;
	slug: string;
	title: string;
	tags: { id: number; name: string }[];

	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;

	createdAt: Date;
	updatedAt: Date;

	isCommentable: boolean;
	content: string;
	excerpt: string | null;

	stats: {
		likesCount: number;
		commentsCount: number;
	};
};
