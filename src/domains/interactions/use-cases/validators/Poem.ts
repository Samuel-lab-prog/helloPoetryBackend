import type { PoemBasicInfo } from '../../ports/ExternalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	PoemStatus,
	PoemModerationStatus,
	PoemVisibility,
} from '@SharedKernel/Enums';

export function poem(poem: PoemBasicInfo) {
	if (!poem.exists)
		throw new NotFoundError(`Poem with id "${poem.id}" not found`);

	return {
		withVisibility(allowedVisibilities: PoemVisibility[]) {
			if (!allowedVisibilities.includes(poem.visibility)) {
				throw new ForbiddenError(
					`Cannot perform this action on a poem with visibility "${poem.visibility}"`,
				);
			}
			return this;
		},

		withModerationStatus(allowedModerationStatuses: PoemModerationStatus[]) {
			if (!allowedModerationStatuses.includes(poem.moderationStatus)) {
				throw new ForbiddenError(
					`Cannot perform this action on a poem with moderation status "${poem.moderationStatus}"`,
				);
			}
			return this;
		},

		withCommentability(allowedCommentability: boolean) {
			if (poem.isCommentable !== allowedCommentability) {
				throw new ForbiddenError(
					`Cannot perform this action on a poem with commentability "${poem.isCommentable}"`,
				);
			}
			return this;
		},

		withStatus(allowedStatuses: PoemStatus[]) {
			if (!allowedStatuses.includes(poem.status)) {
				throw new ForbiddenError(
					`Cannot perform this action on a poem with status "${poem.status}"`,
				);
			}
			return this;
		},
	};
}
