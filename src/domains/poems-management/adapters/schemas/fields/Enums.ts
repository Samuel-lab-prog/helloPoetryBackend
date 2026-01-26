import { t } from 'elysia';
import type {
	PoemStatus,
	PoemVisibility,
	PoemModerationStatus,
} from '../../../use-cases/queries/index';

export const PoemStatusEnumSchema = t.UnionEnum([
	'draft',
	'published',
	'scheduled',
] as const);

export const PoemVisibilityEnumSchema = t.UnionEnum([
	'public',
	'friends',
	'private',
	'unlisted',
] as const);

export const PoemModerationStatusEnumSchema = t.UnionEnum([
	'rejected',
	'removed',
	'approved',
	'pending',
] as const);

type _AssertExtends<_T extends _U, _U> = true;

type _AssertPoemStatus = _AssertExtends<
	typeof PoemStatusEnumSchema.static,
	PoemStatus
>;

type _AssertPoemVisibility = _AssertExtends<
	typeof PoemVisibilityEnumSchema.static,
	PoemVisibility
>;

type _AssertPoemModerationStatus = _AssertExtends<
	typeof PoemModerationStatusEnumSchema.static,
	PoemModerationStatus
>;
