import type { PoemVisibility, PoemStatus } from '../../queries/Index';

export type UpdatePoem = {
	title: string;
	content: string;
	excerpt: string | null;

	tags: string[];
	isCommentable: boolean;
	visibility: PoemVisibility;
	status: PoemStatus;

	addresseeUserId?: number;
	addresseePoemId?: number;
};
