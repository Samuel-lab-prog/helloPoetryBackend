export interface FriendsContractForRecomendationEngine {
	getFollowedUserIds(userId: number): Promise<number[]>;
	getBlockedUserIds(userId: number): Promise<number[]>;
}
