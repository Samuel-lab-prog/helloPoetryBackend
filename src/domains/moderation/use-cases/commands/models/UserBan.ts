export type UserBan = {
	id: number;
	userId: number;
	reason: string;
	startAt: Date;
	endAt: Date | null;
	moderatorId: number;
};
