import { t } from 'elysia';
import type { SelectUsersPage } from '../../use-cases/queries/read-models/index';

import { UserPreviewSchema } from './UserPreview';

export const UsersPageSchema = t.Object({
	users: t.Array(UserPreviewSchema),
	nextCursor: t.Optional(t.Number()),
	hasMore: t.Boolean(),
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertUsersPage = _AssertExtends<
	typeof UsersPageSchema.static,
	SelectUsersPage
>;
