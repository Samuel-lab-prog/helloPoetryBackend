import { eventBus } from '@SharedKernel/events/EventBus';
import { log } from '@GenericSubdomains/utils/logger';
import { notificationsCommandsServices } from './Composition';

eventBus.subscribe('POEM_COMMENT_CREATED', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.authorId,
			type: 'POEM_COMMENT_CREATED',
			title: 'New comment on your poem',
			actorId: p.commenterId,
			entityId: p.poemId,
			entityType: 'POEM',
			body: `Your poem received a comment from ${p.commenterNickname}`,
			data: {
				commentId: p.commentId,
				commenterNickname: p.commenterNickname,
				poemTitle: p.poemTitle,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				commentId: p.commentId,
			},
			'New notification created for poem comment',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				commentId: p.commentId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem comment',
		);
	}
});

eventBus.subscribe('POEM_LIKED', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'POEM_LIKED',
			title: 'Your poem was liked',
			actorId: p.likerId,
			entityId: p.poemId,
			entityType: 'POEM',
			body: `Your poem was liked by ${p.likerNickname}`,
			data: {
				poemId: p.poemId,
				likerNickname: p.likerNickname,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
			},
			'New notification created for poem like',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem like',
		);
	}
});
