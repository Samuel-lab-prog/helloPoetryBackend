import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '@SharedKernel/Enums';

export type UsersRelationBasicInfo = {
	areFriends: boolean;
	areBlocked: boolean;
};

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	status: PoemStatus;
	isCommentable: boolean;
};

export interface PoemsContractForInteractions {
	getPoemInteractionInfo(poemId: number): Promise<PoemBasicInfo>;
}

export interface FriendsContractForInteractions {
	usersRelation(
		userId1: number,
		userId2: number,
	): Promise<UsersRelationBasicInfo>;
}
