import type { BannedUserResponse, SuspendedUserResponse } from './models';

export interface QueriesRepository {
	selectActiveBanByUserId(params: {
		userId: number;
	}): Promise<BannedUserResponse | null>;
	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<SuspendedUserResponse | null>;
}
