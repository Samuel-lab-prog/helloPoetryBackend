export type InsertUser = {
	name: string;
	nickname: string;
	email: string;
	passwordHash: string;
	bio: string;
	avatarUrl: string;
};

export type UpdateUserData = Partial<{
	name: string;
	nickname: string;
	email: string;
	passwordHash: string;
	bio: string;
	avatarUrl: string;
}>;
