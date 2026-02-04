import {
	CreatePoemResultSchema,
	CreatePoemBodySchema,
	UpdatePoemBodySchema,
	UpdatePoemResultSchema,
} from '../../ports/schemas/Index';

export type CreatePoem = (typeof CreatePoemBodySchema)['static'];
export type CreatePoemDB = CreatePoem & { slug: string; authorId: number };
export type CreatePoemResult = (typeof CreatePoemResultSchema)['static'];

export type UpdatePoem = (typeof UpdatePoemBodySchema)['static'];
export type UpdatePoemDB = UpdatePoem & { slug: string };
export type UpdatePoemResult = (typeof UpdatePoemResultSchema)['static'];
