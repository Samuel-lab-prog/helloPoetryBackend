import {
	AuthorPoemReadSchema,
	MyPoemReadSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
	FullPoemReadSchema,
} from '../../ports/schemas/Index';

export type AuthorPoem = (typeof AuthorPoemReadSchema)['static'];
export type MyPoem = (typeof MyPoemReadSchema)['static'];
export type PoemStatus = (typeof PoemStatusEnumSchema)['static'];
export type PoemVisibility = (typeof PoemVisibilityEnumSchema)['static'];
export type PoemModerationStatus =
	(typeof PoemModerationStatusEnumSchema)['static'];
export type FullPoem = (typeof FullPoemReadSchema)['static'];
