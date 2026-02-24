import type { PoemBasicInfo } from '@Domains/poems-management/public/Index';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import type {
	PoemStatus,
	PoemModerationStatus,
	PoemVisibility,
} from '@SharedKernel/Enums';

export function poem(poem: PoemBasicInfo) {
	if (!poem.exists)
		throw new NotFoundError(`Poem with id ${poem.id} not found`);

	return {
		withVisibility(allowedVisibilities: PoemVisibility[], msg?: string) {
			if (!allowedVisibilities.includes(poem.visibility))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with visibility ${poem.visibility}`,
				);
			return this;
		},

		withModerationStatus(
			allowedModerationStatuses: PoemModerationStatus[],
			msg?: string,
		) {
			if (!allowedModerationStatuses.includes(poem.moderationStatus))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with moderation status ${poem.moderationStatus}`,
				);
			return this;
		},

		withCommentability(allowedCommentability: boolean, msg?: string) {
			if (poem.isCommentable !== allowedCommentability)
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with commentability ${poem.isCommentable}`,
				);
			return this;
		},

		withStatus(allowedStatuses: PoemStatus[], msg?: string) {
			if (!allowedStatuses.includes(poem.status))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with status ${poem.status}`,
				);
			return this;
		},
	};
}
