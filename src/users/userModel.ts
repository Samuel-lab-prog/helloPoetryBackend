import { pool } from '../db/connection.ts';
import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import type { User, NewUser, FullUser, FullUserRow } from './userTypes.ts';
import { mapFullUserRowToFullUser } from './userTypes.ts';
const isProd = process.env.NODE_ENV === 'production';

export async function insertUser(userData: NewUser): Promise<Pick<User, 'id'>> {
  const { nickname, fullName, email, password, bio, avatarId, personalityId } = userData;

  const fields = ['nickname', 'full_name', 'email', 'password_hash'];
  const values: (string | number)[] = [nickname, fullName, email, password];
  
  if (bio !== undefined) {
    fields.push('bio');
    values.push(bio);
  }
  if (avatarId !== undefined) {
    fields.push('avatar_id');
    values.push(avatarId);
  }
  if (personalityId !== undefined) {
    fields.push('personality_id');
    values.push(personalityId);
  }

  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO users (${fields.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `;

  try {
    const { rows } = await pool.query<Pick<User, 'id'>>(query, values);

    if (!rows[0]) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Failed to create user: no userId returned from database'],
      });
    }

    return { id: rows[0].id };
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      if (error.detail?.includes('email')) {
        throw new AppError({
          statusCode: 409,
          errorMessages: ['Email already in use'],
        });
      }
      if (error.detail?.includes('nickname')) {
        throw new AppError({
          statusCode: 409,
          errorMessages: ['Nickname already in use'],
        });
      }
    }

    if (error instanceof AppError) throw error;

    console.error('Database error while inserting user:', error);
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating user'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function selectUser(
  email?: string,
  id?: number,
  nickname?: string
): Promise<FullUser | null> {

  let query = '';
  let value: string | number | undefined;

  if (email !== undefined) {
    query = 'SELECT * FROM users WHERE email = $1 LIMIT 2';
    value = email;
  } else if (id !== undefined) {
    query = 'SELECT * FROM users WHERE id = $1 LIMIT 2';
    value = id;
  } else if (nickname !== undefined) {
    query = 'SELECT * FROM users WHERE nickname = $1 LIMIT 2';
    value = nickname;
  }

  try {
    const { rows } = await pool.query<FullUserRow>(query, [value]);

    if (!rows[0]) return null;

    if (rows.length > 1) {
      throw new AppError({
        statusCode: 500,
        errorMessages: [`Duplicate users detected for ${value}`],
      });
    }

    const row = rows[0];

    return mapFullUserRowToFullUser(row);
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

