import { avatarSchema } from './avatarSchemas.ts';

export type Avatar = typeof avatarSchema['static'];
export type AvatarRow = Avatar; // Assuming the database row has the same structure