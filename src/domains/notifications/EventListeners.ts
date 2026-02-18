import { eventBus } from '@SharedKernel/events/EventBus';
import { log } from '@GenericSubdomains/utils/Logger';
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

eventBus.subscribe('POEM_DEDICATED', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'POEM_DEDICATED',
			title: 'A poem was dedicated to you',
			actorId: p.dedicatorId,
			entityId: p.poemId,
			entityType: 'POEM',
			body: `The poem "${p.poemTitle}" was dedicated to you by ${p.dedicatorNickname}`,
			data: {
				poemId: p.poemId,
				poemTitle: p.poemTitle,
				dedicatorNickname: p.dedicatorNickname,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
			},
			'New notification created for poem dedication',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem dedication',
		);
	}
});

eventBus.subscribe('NEW_FRIEND_REQUEST', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.recipientId,
			type: 'NEW_FRIEND_REQUEST',
			title: 'New friend request',
			actorId: p.requesterId,
			entityId: p.requesterId,
			entityType: 'USER',
			body: `${p.requesterNickname} sent you a friend request`,
			data: {
				requesterId: p.requesterId,
				requesterNickname: p.requesterNickname,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'USER',
				userId: p.recipientId,
			},
			'New notification created for friend request',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'USER',
				userId: p.recipientId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for friend request',
		);
	}
});

eventBus.subscribe('NEW_FRIEND', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'NEW_FRIEND',
			title: 'You have a new friend',
			actorId: p.newFriendId,
			entityId: p.newFriendId,
			entityType: 'USER',
			body: `You are now friends with ${p.newFriendNickname}`,
			data: {
				newFriendId: p.newFriendId,
				newFriendNickname: p.newFriendNickname,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'USER',
				userId: p.userId,
			},
			'New notification created for new friend',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'USER',
				userId: p.userId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for new friend',
		);
	}
});

eventBus.subscribe('POEM_COMMENT_REPLIED', async (p) => {
	try {
		await notificationsCommandsServices.createNotification({
			userId: p.originalCommenterId,
			type: 'POEM_COMMENT_REPLIED',
			title: 'Your comment received a reply',
			actorId: p.replierId,
			entityId: p.commentId,
			entityType: 'COMMENT',
			body: `Your comment on the poem "${p.poemTitle}" received a reply from ${p.replierNickname}`,
			data: {
				commentId: p.commentId,
				parentCommentId: p.parentCommentId,
				poemId: p.poemId,
				replierId: p.replierId,
				replierNickname: p.replierNickname,
				poemTitle: p.poemTitle,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'COMMENT',
				commentId: p.commentId,
			},
			'New notification created for comment reply',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'COMMENT',
				commentId: p.commentId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for comment reply',
		);
	}
});

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
