import { t } from 'elysia';
import type { UserPreview } from '../../use-cases/queries/read-models/index';
import { UserRoleEnumSchema } from './fields/Enums';

export const UserPreviewSchema = t.Object({
	avatarUrl: t.String(),
	id: t.Number(),
	nickname: t.String(),
	role: UserRoleEnumSchema,
});

type _AssertExtends<_T extends _U, _U> = true;
type _AssertUserPreview = _AssertExtends<
	typeof UserPreviewSchema.static,
	UserPreview
>;
