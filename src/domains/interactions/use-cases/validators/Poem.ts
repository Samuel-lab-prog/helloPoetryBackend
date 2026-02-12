import type { PoemBasicInfo } from '../../ports/ExternalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	PoemStatus,
	PoemModerationStatus,
	PoemVisibility,
} from '@SharedKernel/Enums';

export function poem(poem: PoemBasicInfo) {
	if (!poem.exists)
		throw new NotFoundError(`Poem with id ${poem.id} not found`);

	return {
		withVisibility(allowedVisibilities: PoemVisibility[]) {
			if (!allowedVisibilities.includes(poem.visibility)) {
				throw new ForbiddenError(
					`Poems with visibility "${poem.visibility}" cannot be commented`,
				);
			}
			return this;
		},

		withModerationStatus(allowedModerationStatuses: PoemModerationStatus[]) {
			if (!allowedModerationStatuses.includes(poem.moderationStatus)) {
				throw new ForbiddenError(
					`Poems with moderation status "${poem.moderationStatus}" cannot be commented`,
				);
			}
			return this;
		},

		withCommentability(allowedCommentability: boolean) {
			if (poem.isCommentable !== allowedCommentability) {
				throw new ForbiddenError(
					`Poems with commentability "${poem.isCommentable}" cannot be commented`,
				);
			}
			return this;
		},

		withStatus(allowedStatuses: PoemStatus[]) {
			if (!allowedStatuses.includes(poem.status)) {
				throw new ForbiddenError(
					`Poems with status "${poem.status}" cannot be commented`,
				);
			}
			return this;
		},
	};
}
