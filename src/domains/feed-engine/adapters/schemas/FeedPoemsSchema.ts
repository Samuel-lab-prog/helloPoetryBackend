import { t } from 'elysia';

export const feedPoemSchema = t.Object({
	id: t.Number(),
	authorId: t.Number(),
	content: t.String(),
	title: t.String(),
	tags: t.Array(t.String()),
	createdAt: t.Date(),
});
