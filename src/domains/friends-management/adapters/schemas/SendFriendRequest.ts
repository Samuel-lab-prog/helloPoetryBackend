import { t } from 'elysia';
import type { FriendRequest } from '../../use-cases/commands/models/Index';

export const SendFriendRequestSchema = t.Object({
	requesterId: t.Number(),
	addresseeId: t.Number(),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertCreateUser = _AssertExtends<
	typeof SendFriendRequestSchema.static,
	FriendRequest
>;
