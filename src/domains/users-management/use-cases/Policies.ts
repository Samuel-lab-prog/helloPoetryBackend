import type { UserStatus } from './Models';
import { CrossUserUpdateError, UserBannedError } from './Errors';

export type CanUpdatePolicyInput = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
};

export function canUpdateData(c: CanUpdatePolicyInput): void {
	const isResourceOwner = c.requesterId === c.targetId;
	const isBanned = c.requesterStatus === 'banned';

	if (!isResourceOwner) throw new CrossUserUpdateError();
	if (isBanned) throw new UserBannedError();
}
