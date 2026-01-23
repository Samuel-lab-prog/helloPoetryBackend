type CanAccessClientInfoPolicyParams = {
	requesterId: number;
	requesterRole: string;
	targetId: number;
};

export function canAccessClientInfo(
	ctx: CanAccessClientInfoPolicyParams,
): boolean {
	const { requesterId, requesterRole, targetId } = ctx;

	return requesterRole === 'admin' || requesterId === targetId;
}

type IsAdminUserPolicyParams = { userRole: string };

export function isAdminUser(ctx: IsAdminUserPolicyParams): boolean {
	const { userRole } = ctx;

	return userRole === 'admin';
}
