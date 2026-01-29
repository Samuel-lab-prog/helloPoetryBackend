import { t } from 'elysia';

export const FriendshipStatusSchema = t.Object({
	exists: t.Boolean(),
	status: t.String(),
	canSendRequest: t.Boolean(),
	canAcceptRequest: t.Boolean(),
	canRemoveFriend: t.Boolean(),
	requesterId: t.Any(),
});
