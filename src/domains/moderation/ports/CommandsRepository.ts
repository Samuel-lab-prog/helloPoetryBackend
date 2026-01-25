import type {
	UserBan,
	UserSuspension,
} from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	createBan(params: {
		userId: number;
		reason: string;
		moderatorId: number;
	}): Promise<UserBan>;
	createSuspension(params: {
		userId: number;
		reason: string;
		moderatorId: number;
	}): Promise<UserSuspension>;
}
