import type {
	CommandsRepository,
	ModeratePoemParams,
} from '../../../ports/Commands';
import type { QueriesRepository } from '../../../ports/Queries';
import type { ModeratePoemResult } from '../../../ports/Models';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

const ALLOWED_STATUSES = new Set([
	'approved',
	'rejected',
	'pending',
	'removed',
] as const);

export function moderatePoemFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function moderatePoem(
		params: ModeratePoemParams,
	): Promise<ModeratePoemResult> {
		const { poemId, moderationStatus, meta } = params;

		if (meta.requesterRole !== 'moderator' && meta.requesterRole !== 'admin') {
			throw new ForbiddenError('Insufficient permissions');
		}

		if (meta.requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active');
		}

		if (!ALLOWED_STATUSES.has(moderationStatus)) {
			throw new ForbiddenError('Invalid moderation status');
		}

		const poem = await queriesRepository.selectPoemById(poemId);
		if (!poem) throw new NotFoundError('Poem not found');

		if (poem.moderationStatus === 'removed') {
			throw new ForbiddenError('Cannot moderate removed poem');
		}

		const result = await commandsRepository.updatePoemModerationStatus({
			poemId,
			moderationStatus,
		});

		if (result.ok) return result.data;

		throw result.error;
	};
}
