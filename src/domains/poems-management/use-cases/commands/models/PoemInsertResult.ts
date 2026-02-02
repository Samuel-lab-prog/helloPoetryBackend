import type {
	PoemVisibility,
	PoemStatus,
	PoemModerationStatus,
} from '../../queries/Index';

export type PoemInsertResult = {
	id: number;
	title: string;
	visibility: PoemVisibility;
	status: PoemStatus;
	moderationStatus: PoemModerationStatus;
};
