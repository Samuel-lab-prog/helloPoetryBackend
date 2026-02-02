import type { PoemVisibility, PoemStatus } from '../../queries/Index';

export type CreatePoem = {
	title: string;
	content: string;
	excerpt: string | null;
	authorId: number;

	tags?: string[];
	isCommentable?: boolean;
	visibility?: PoemVisibility;
	status?: PoemStatus;

	addresseeUserId?: number;
	addresseePoemId?: number;
};
