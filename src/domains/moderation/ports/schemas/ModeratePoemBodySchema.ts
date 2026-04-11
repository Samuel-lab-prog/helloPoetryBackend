import { t } from 'elysia';

export const ModeratePoemBodySchema = t.Object({
	moderationStatus: t.UnionEnum(['approved', 'rejected'] as const),
});
