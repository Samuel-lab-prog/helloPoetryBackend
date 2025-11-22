import { pool } from '../db/connection.ts';
import { AppError } from '../utils/AppError.ts';
import type { Personality, PersonalityRow } from './personalityTypes.ts';
const isProd = process.env.NODE_ENV === 'production';

export async function selectPersonalities(): Promise<Personality[]> {
  const query = `
    SELECT * FROM personalities
  `;
  try {
    const { rows } = await pool.query<PersonalityRow>(query);
    if (rows.length === 0) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['No personalities found in database'],
      });
    }
    return rows;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to retrieve personalities from database'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}
