import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
	UserRole,
	UserStatus,
} from '@SharedKernel/Enums';

export interface FriendsContractForInteractions {
	usersRelation(
		userId1: number,
		userId2: number,
	): Promise<UsersRelationBasicInfo>;
}

export type UsersRelationBasicInfo = {
	areFriends: boolean;
	areBlocked: boolean;
};

export type UserBasicInfo = {
	exists: boolean;
	id: number;
	status: UserStatus;
	role: UserRole;
};

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	deletedAt: Date | null;
	status: PoemStatus;
	isCommentable: boolean;
};

export interface PoemsContractForInteractions {
	getPoemInteractionInfo(poemId: number): Promise<PoemBasicInfo>;
}

export interface UsersContractForInteractions {
	getUserBasicInfo(userId: number): Promise<UserBasicInfo>;
}
