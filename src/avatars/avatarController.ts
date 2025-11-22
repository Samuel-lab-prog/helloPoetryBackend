import type { Avatar } from './avatarTypes.ts';
import { selectAvatars } from './avatarModel.ts';

export async function getAvatars(): Promise<Avatar[]> {
  return await selectAvatars();
}
