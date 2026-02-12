import type { UserBasicInfo } from '../../ports/ExternalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';

export function user(user: UserBasicInfo) {
	if (!user.exists)
		throw new NotFoundError(`User with id ${user.id} not found`);
	return {
		withStatus(allowedStatuses: string[]) {
			if (!allowedStatuses.includes(user.status)) {
				throw new ForbiddenError(
					`User with status "${user.status}" cannot perform this action`,
				);
			}
			return this;
		},
		withRole(allowedRoles: string[]) {
			if (!allowedRoles.includes(user.role)) {
				throw new ForbiddenError(
					`User with role "${user.role}" cannot perform this action`,
				);
			}
			return this;
		},
	};
}
