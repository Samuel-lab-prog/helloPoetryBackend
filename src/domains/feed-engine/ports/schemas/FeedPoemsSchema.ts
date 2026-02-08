import { t } from 'elysia';

export const feedPoemSchema = t.Object({
	id: t.Number(),
	content: t.String(),
	title: t.String(),
	slug: t.String(),
	tags: t.Array(t.String()),
	createdAt: t.Date(),
	author: t.Object({
		id: t.Number(),
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
	}),
});
