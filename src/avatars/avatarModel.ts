import { pool } from '../db/connection.ts';
import { AppError } from '../utils/AppError.ts';
import type { Avatar, AvatarRow } from './avatarTypes.ts';
const isProd = process.env.NODE_ENV === 'production';

export async function selectAvatars(): Promise<Avatar[]> {
  const query = `
    SELECT * FROM avatars
  `;
  try{
    const { rows } = await pool.query<AvatarRow>(query);
    return rows;
  }catch(error){
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to retrieve avatars from database'],
      originalError: isProd ? undefined : error as Error,
    });
  }
}