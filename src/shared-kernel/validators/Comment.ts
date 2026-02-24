import type { PoemComment } from '@Domains/interactions/ports/Models';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import type { CommentStatus } from '@SharedKernel/Enums';

export function comment(comment?: PoemComment | null) {
	if (!comment) throw new NotFoundError(`Comment not found`);

	return {
		withStatus(allowedStatuses: CommentStatus[], msg?: string): PoemComment {
			if (!allowedStatuses.includes(comment.status))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a comment with status ${comment.status}`,
				);
			return comment;
		},
	};
}
