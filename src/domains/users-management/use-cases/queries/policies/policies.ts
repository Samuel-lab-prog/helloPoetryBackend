import type { UserRole } from '../models/Enums';

type PolicyInput = {
	requesterId: number;
	requesterRole: UserRole;
	targetId: number;
};

export function canAccessUserInfo(c: PolicyInput): boolean {
	return c.requesterRole === 'moderator' || c.requesterId === c.targetId;
}
