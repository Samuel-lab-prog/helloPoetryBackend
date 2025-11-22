import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import { pool } from '../db/connection.ts';
import { mapFullUserRowToFullUser } from './userTypes.ts';
import type { User, NewUser, FullUser, FullUserRow, UpdateUser } from './userTypes.ts';

const isProd = process.env.NODE_ENV === 'production';

export async function insertUser(userData: NewUser): Promise<Pick<User, 'id'>> {
  const { nickname, fullName, email, password, bio, avatarId, personalityId } = userData;

  const fields = ['nickname', 'full_name', 'email', 'password_hash'];
  const values: (string | number)[] = [nickname, fullName, email, password];

  if (bio) {
    fields.push('bio');
    values.push(bio);
  }
  if (avatarId) {
    fields.push('avatar_id');
    values.push(avatarId);
  }
  if (personalityId) {
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
  if (!email && !id && !nickname) {
    throw new AppError({
      statusCode: 400,
      errorMessages: [
        'At least one identifier (email, id, nickname) must be provided to select a user',
      ],
    });
  }

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

export async function updateUserLastLogin(userId: number): Promise<FullUser | null> {
  const query = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = $1
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) {
      return null;
    }
    return mapFullUserRowToFullUser(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while updating user last login'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}
export async function updateUser(userId: number, updates: UpdateUser): Promise<FullUser | null> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let index = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'fullName') {
      fields.push(`full_name = $${index}`);
    } else if (key === 'avatarId') {
      fields.push(`avatar_id = $${index}`);
    } else if (key === 'personalityId') {
      fields.push(`personality_id = $${index}`);
    } else {
      fields.push(`${key} = $${index}`);
    }
    values.push(value);
    index++;
  }
  const query = `
    UPDATE users
    SET ${fields.join(', ')},
    updated_at = NOW()
    WHERE id = $${index}
    RETURNING *
  `;
  values.push(userId);

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return null;
    }
    return mapFullUserRowToFullUser(rows[0]);
  } catch (error) {
    console.error(error);
    if (error instanceof DatabaseError && error.code === '23505') {
      if (error.detail?.includes('nickname')) {
        throw new AppError({
          statusCode: 409,
          errorMessages: ['Nickname already in use'],
        });
      }
    }

    if (error instanceof AppError) throw error;

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while updating user'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}
