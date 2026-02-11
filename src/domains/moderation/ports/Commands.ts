import type { UserRole } from '@SharedKernel/Enums';
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../use-cases/Models';

export type BanUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
};

export type SuspendUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
};

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

export interface CommandsRouterServices {
	banUser(params: BanUserParams): Promise<BannedUserResponse>;
	suspendUser(params: SuspendUserParams): Promise<SuspendedUserResponse>;
}
