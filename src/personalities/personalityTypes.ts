import type { personalitySchema } from './personalitySchemas.ts';

export type Personality = (typeof personalitySchema)['static'];
export type PersonalityRow = Personality; // Assuming the database row has the same structure
