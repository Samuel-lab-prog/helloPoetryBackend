import type { poemVisibility, poemStatus, poemModerationStatus } from './Enums';

export type AuthorPoemListItem = {
	id: number;
	slug: string;
	title: string;
	tags: { id: number; name: string }[];

	status: poemStatus;
	visibility: poemVisibility;
	moderationStatus: poemModerationStatus;

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
