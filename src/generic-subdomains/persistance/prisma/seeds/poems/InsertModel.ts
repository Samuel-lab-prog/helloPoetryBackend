import type {
	poemStatus,
	poemVisibility,
	poemModerationStatus,
} from '@Domains/poems-management/use-cases/queries/read-models/Enums';

export type InsertPoem = {
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	isCommentable?: boolean;
	tags: string[];

	status?: poemStatus;
	visibility?: poemVisibility;
	moderationStatus?: poemModerationStatus;

	authorId: number;
};
