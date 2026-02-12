import type { PoemBasicInfo } from '../../ports/ExternalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';

export function poem(poem: PoemBasicInfo) {
	if (!poem.exists)
		throw new NotFoundError(`Poem with id ${poem.id} not found`);
	return {
		withVisibility(allowedVisibilities: string[]) {
			if (!allowedVisibilities.includes(poem.visibility)) {
				throw new ForbiddenError(
					`Poem with visibility "${poem.visibility}" cannot be commented`,
				);
			}
			return this;
		},
		withModerationStatus(allowedStatuses: string[]) {
			if (!allowedStatuses.includes(poem.moderationStatus)) {
				throw new ForbiddenError(
					`Poem with moderation status "${poem.moderationStatus}" cannot be commented`,
				);
			}
			return this;
		},
	};
}
