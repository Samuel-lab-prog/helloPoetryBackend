import type {
	CommandsRepository,
	ModeratePoemParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { ModeratePoemResult } from '../../../ports/models';
import {
	ForbiddenError,
	NotFoundError,
} from '@GenericSubdomains/utils/domainError';
import { type EventBus } from '@SharedKernel/events/EventBus';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	eventBus: EventBus;
}

const ALLOWED_STATUSES = new Set([
	'approved',
	'rejected',
	'pending',
	'removed',
] as const);

// eslint-disable-next-line max-lines-per-function
export function moderatePoemFactory({
	commandsRepository,
	queriesRepository,
	eventBus,
}: Dependencies) {
	// eslint-disable-next-line max-lines-per-function
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

		if (result.ok) {
			const shouldNotify =
				moderationStatus === 'approved' && poem.moderationStatus !== 'approved';

			if (shouldNotify) {
				eventBus.publish('POEM_APPROVED', {
					poemId,
					poemTitle: poem.title,
					authorId: poem.author.id,
					authorNickname: poem.author.nickname,
					actorAvatarUrl: poem.author.avatarUrl ?? null,
				});

				const notificationsData =
					await queriesRepository.selectPoemNotificationsData(poemId);

				if (notificationsData) {
					const {
						authorId,
						authorNickname,
						authorAvatarUrl,
						dedicatedUserIds,
						mentionedUserIds,
						title,
						id,
					} = notificationsData;

					for (const toUserId of dedicatedUserIds) {
						eventBus.publish('POEM_DEDICATED', {
							poemId: id,
							userId: toUserId,
							dedicatorId: authorId,
							dedicatorNickname: authorNickname,
							actorAvatarUrl: authorAvatarUrl ?? null,
							poemTitle: title,
						});
					}

					for (const mentionedUserId of mentionedUserIds) {
						eventBus.publish('USER_MENTION_IN_POEM', {
							poemId: id,
							poemTitle: title,
							userId: mentionedUserId,
							mentionerId: authorId,
							mentionerNickname: authorNickname,
							actorAvatarUrl: authorAvatarUrl ?? null,
						});
					}
				}
			}

			return result.data;
		}

		throw result.error;
	};
}
