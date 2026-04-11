import type {
	BannedUserResponse,
	PoemModerationRead,
	PoemNotificationsData,
	SuspendedUserResponse,
} from './models';

export interface QueriesRepository {
	selectActiveBanByUserId(params: {
		userId: number;
	}): Promise<BannedUserResponse | null>;
	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<SuspendedUserResponse | null>;

	selectPoemById(poemId: number): Promise<PoemModerationRead | null>;
	selectPoemNotificationsData(
		poemId: number,
	): Promise<PoemNotificationsData | null>;
}
