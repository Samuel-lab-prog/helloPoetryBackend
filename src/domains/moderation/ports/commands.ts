import type {
	UserRole,
	UserStatus,
	PoemModerationStatus,
} from '@SharedKernel/Enums';
import type {
	BannedUserResponse,
	ModeratePoemResult,
	SuspendedUserResponse,
} from './models';
import type { CommandResult } from '@SharedKernel/Types';

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

export type ModeratePoemParams = {
	poemId: number;
	moderationStatus: PoemModerationStatus;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
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
	updatePoemModerationStatus(params: {
		poemId: number;
		moderationStatus: PoemModerationStatus;
	}): Promise<CommandResult<ModeratePoemResult>>;
}

export interface CommandsRouterServices {
	banUser(params: BanUserParams): Promise<BannedUserResponse>;
	suspendUser(params: SuspendUserParams): Promise<SuspendedUserResponse>;
	moderatePoem(params: ModeratePoemParams): Promise<ModeratePoemResult>;
}
