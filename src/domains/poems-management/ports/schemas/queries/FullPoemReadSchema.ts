import { t } from 'elysia';

import {
	idSchema,
	DateSchema,
	NonNegativeIntegerSchema,
} from '@SharedKernel/Schemas';

import {
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
} from '../fields/Enums';

export const FullPoemReadSchema = t.Object({
	id: idSchema,
	slug: t.String(),
	title: t.String(),
	content: t.String(),

	excerpt: t.Union([t.String(), t.Null()]),

	isCommentable: t.Boolean(),
	createdAt: DateSchema,
	updatedAt: DateSchema,

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
		friendsIds: t.Array(idSchema),
	}),

	dedicatedToUser: t.Optional(
		t.Union([
			t.Object({
				id: idSchema,
				name: t.String(),
				nickname: t.String(),
				avatarUrl: t.String(),
			}),
			t.Null(),
		]),
	),

	dedicatedToPoem: t.Optional(
		t.Union([
			t.Object({
				id: idSchema,
				title: t.String(),
				slug: t.String(),
				authorId: idSchema,
			}),
			t.Null(),
		]),
	),

	tags: t.Array(
		t.Object({
			id: idSchema,
			name: t.String(),
		}),
	),

	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
