import type { UsersRelationBasicInfo } from '../../ports/ExternalServices';
import { ForbiddenError } from '@DomainError';

export function relation(relation: UsersRelationBasicInfo) {
	return {
		withNoBlocking() {
			if (relation.areBlocked) {
				throw new ForbiddenError(
					'Cannot perform this action while a blocking relationship exists',
				);
			}
			return this;
		},
		withFriendship() {
			if (!relation.areFriends) {
				throw new ForbiddenError(
					'Cannot perform this action without a friendship relationship',
				);
			}
			return this;
		},
	};
}
