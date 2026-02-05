import type { UserRole, UserStatus } from './Models';
import { CrossUserUpdateError, UserNotActiveError } from './Errors';

type CanUpdatePolicyInput = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
};

export function canUpdateData(c: CanUpdatePolicyInput): void {
	const isResourceOwner = c.requesterId === c.targetId;
	const isActive = c.requesterStatus === 'active';

	if (!isResourceOwner) throw new CrossUserUpdateError();
	if (!isActive) throw new UserNotActiveError();
}

type PolicyInput = {
	requesterId: number;
	requesterRole: UserRole;
	targetId: number;
};

export function canAccessUserInfo(c: PolicyInput): boolean {
	return c.requesterRole === 'moderator' || c.requesterId === c.targetId;
}
