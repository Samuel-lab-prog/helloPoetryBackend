import type { UserBasicInfo } from '@SharedKernel/contracts/users/Index';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { ForbiddenError, NotFoundError } from '@DomainError';

export function user(user: UserBasicInfo) {
	if (!user.exists)
		throw new NotFoundError(`User with id ${user.id} not found`);
	return {
		withStatus(allowedStatuses: UserStatus[]) {
			if (!allowedStatuses.includes(user.status)) 
				throw new ForbiddenError(
					`User with status ${user.status} cannot perform this action`,
				);
			return this;
		},
		withRole(allowedRoles: UserRole[]) {
			if (!allowedRoles.includes(user.role)) 
				throw new ForbiddenError(
					`User with role ${user.role} cannot perform this action`,
				);
			return this;
		},
	};
}
