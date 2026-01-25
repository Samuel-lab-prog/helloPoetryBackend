export type UserSuspension = {
	id: number;
	userId: number;
	reason: string;
	startAt: Date;
	moderatorId: number;
};
