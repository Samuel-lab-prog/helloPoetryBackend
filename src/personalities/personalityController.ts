import type { Personality } from './personalityTypes.ts';
import { selectPersonalities } from './personalityModel.ts';

export async function getPersonalities(): Promise<Personality[]> {
  return await selectPersonalities();
}
