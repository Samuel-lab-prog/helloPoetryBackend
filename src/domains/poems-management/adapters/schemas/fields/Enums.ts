import { t } from 'elysia';
import type {
	poemStatus,
	poemVisibility,
	poemModerationStatus,
} from '../../../use-cases/queries/read-models/Enums';

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
	poemStatus
>;

type _AssertPoemVisibility = _AssertExtends<
	typeof PoemVisibilityEnumSchema.static,
	poemVisibility
>;

type _AssertPoemModerationStatus = _AssertExtends<
	typeof PoemModerationStatusEnumSchema.static,
	poemModerationStatus
>;
