import type {
	UserBan,
	UserSuspension,
} from '../use-cases/commands/models/Index';

export interface QueriesRepository {
	selectActiveBanByUserId(params: { userId: number }): Promise<UserBan | null>;
	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<UserSuspension | null>;
}
