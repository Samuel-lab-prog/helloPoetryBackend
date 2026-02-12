import type {
	PoemModerationStatus,
	PoemVisibility,
	UserRole,
	UserStatus,
} from '@SharedKernel/Enums';

export interface FriendsContractForInteractions {
	areFriends(userAId: number, userBId: number): Promise<boolean>;
	areBlocked(userAId: number, userBId: number): Promise<boolean>;
}

export interface PoemsContractForInteractions {
	getPoemInteractionInfo(poemId: number): Promise<{
		exists: boolean;
		authorId: number;
		visibility: PoemVisibility | null;
		moderationStatus: PoemModerationStatus | null;
		deletedAt: Date | null;
	}>;
}

type UserBasicInfo = {
	exists: boolean;
	id: number | null;
	status: UserStatus | null;
	role: UserRole | null;
};

export interface UsersContractForInteractions {
	getUserBasicInfo(userId: number): Promise<UserBasicInfo>;
}
