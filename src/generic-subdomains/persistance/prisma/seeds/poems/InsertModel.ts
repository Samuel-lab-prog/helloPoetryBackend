import type {
	PoemStatus,
	PoemVisibility,
	PoemModerationStatus,
} from '@Domains/poems-management/use-cases/queries/read-models/Enums';

export type InsertPoem = {
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	isCommentable?: boolean;
	tags: string[];

	status?: PoemStatus;
	visibility?: PoemVisibility;
	moderationStatus?: PoemModerationStatus;

	authorId: number;
};
