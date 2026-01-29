export interface FriendsContractForInteractions {
	areFriends(userAId: number, userBId: number): Promise<boolean>;
	areBlocked(userAId: number, userBId: number): Promise<boolean>;
}
