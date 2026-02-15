export type UsersRelationBasicInfo = {
	areFriends: boolean;
	areBlocked: boolean;
};

export interface FriendsContractForInteractions {
	usersRelation(
		userId1: number,
		userId2: number,
	): Promise<UsersRelationBasicInfo>;
}
