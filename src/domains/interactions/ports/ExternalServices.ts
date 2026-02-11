import type { PoemVisibility } from '@SharedKernel/Enums';

export interface FriendsContractForInteractions {
	areFriends(userAId: number, userBId: number): Promise<boolean>;
	areBlocked(userAId: number, userBId: number): Promise<boolean>;
}

export interface PoemsContractForInteractions {
	getPoemInteractionInfo(poemId: number): Promise<{
		exists: boolean;
		authorId: number;
		visibility: PoemVisibility | null;
	}>;
}
