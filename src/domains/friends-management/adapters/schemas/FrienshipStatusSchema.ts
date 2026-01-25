import { t } from 'elysia';
import type { FriendshipStatusSnapshot } from '../../use-cases/queries/models/Index';

export const FriendshipStatusSchema = t.Object({
	exists: t.Boolean(),
	status: t.String(),
	canSendRequest: t.Boolean(),
	canAcceptRequest: t.Boolean(),
	canRemoveFriend: t.Boolean(),
	requesterId: t.Any(),
});

type _AssertExtends<_T extends _U, _U> = true;
type _Assert = _AssertExtends<
	typeof FriendshipStatusSchema.static,
	FriendshipStatusSnapshot
>;
