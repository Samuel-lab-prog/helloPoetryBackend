import {
	PoemCreationResultSchema,
	CreatePoemBodySchema,
	UpdatePoemBodySchema,
} from '../../ports/schemas/Index';

export type CreatePoem = (typeof CreatePoemBodySchema)['static'];
export type UpdatePoem = (typeof UpdatePoemBodySchema)['static'];
export type CreatePoemResult = (typeof PoemCreationResultSchema)['static'];
export type UpdatePoemResult = UpdatePoem;

export type CreatePoemDB = CreatePoem & { slug: string; authorId: number };
export type UpdatePoemDB = UpdatePoem & { slug: string };
