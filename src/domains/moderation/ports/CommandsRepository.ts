import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../use-cases/Models';

export interface CommandsRepository {
	createBan(params: {
		userId: number;
		reason: string;
		moderatorId: number;
	}): Promise<BannedUserResponse>;
	createSuspension(params: {
		userId: number;
		reason: string;
		moderatorId: number;
	}): Promise<SuspendedUserResponse>;
}
