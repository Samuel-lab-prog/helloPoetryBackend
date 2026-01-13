import type { userRole } from '../../../queries/read-models/Enums';

type PolicyInput = {
	requesterId: number;
	requesterRole: userRole;
	targetId: number;
};

export function canAccessUserInfo(c: PolicyInput): boolean {
	return c.requesterRole === 'moderator' || c.requesterId === c.targetId;
}
