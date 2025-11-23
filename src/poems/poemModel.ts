import { AppError } from '../utils/AppError.ts';
import { pool } from '../db/connection.ts';
import type {
  FullPoem,
  FullPoemRow,
  InsertPoem,
} from './poemTypes.ts';
import { mapFullPoemRowToFullPoem } from './poemTypes.ts';
import { DatabaseError } from 'pg';

const isProd = process.env.NODE_ENV === 'production';

export async function insertPoem(data: InsertPoem): Promise<{ id: number }> {
  const {
    title,
    content,
    userId,
    slug
  } = data;

  const query = `
    INSERT INTO poems (title, content, user_id, slug)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  try {
    const { rows } = await pool.query(query, [
      title,
      content,
      userId,
      slug
    ]);

    if (!rows[0])
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Failed to create poem: no id returned'],
      });

    return { id: rows[0].id };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof DatabaseError && error.code === '23505') {
      if (error.detail?.includes('slug')) {
        throw new AppError({
          statusCode: 409,
          errorMessages: ['Poem slug already in use'],
        });
      }
    }
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating poem'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function selectPoemById(poemId: number): Promise<FullPoem | null> {
  const query = `
    SELECT *
    FROM poems
    WHERE id = $1
    LIMIT 2
  `;
  try {
    const { rows } = await pool.query<FullPoemRow>(query, [poemId]);
    if (!rows[0]) return null;

    if (rows.length > 1) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Database returned multiple poems with the same ID'],
      });
    }
    return mapFullPoemRowToFullPoem(rows[0]);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while retrieving poem by ID'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function selectPoemsByUserId(userId: number): Promise<FullPoem[]> {
  const query = `
    SELECT *
    FROM poems
    WHERE user_id = $1
  `;
  try {
    const { rows } = await pool.query<FullPoemRow>(query, [userId]);
    return rows.map(mapFullPoemRowToFullPoem);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while retrieving poems by user ID'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function updatePoemStatus(
  poemId: number,
  status: 'draft' | 'published'
): Promise<FullPoem | null> {
  const query = `
    UPDATE poems
    SET status = $1,
        updated_at = NOW(),
        published_at = CASE WHEN $1 = 'published' THEN NOW() ELSE NULL END
    WHERE id = $2
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(query, [status, poemId]);

    if (!rows[0]) return null;

    return mapFullPoemRowToFullPoem(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while updating poem status'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function deletePoem(poemId: number): Promise<FullPoem | null> {
  const query = `
    UPDATE poems
    SET deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(query, [poemId]);

    if (!rows[0]) return null;

    return mapFullPoemRowToFullPoem(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while deleting poem'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function updatePoemVisibility(
  poemId: number,
  visibility: 'public' | 'private' | 'unlisted'
): Promise<FullPoem | null> {
  const query = `
    UPDATE poems
    SET visibility = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [visibility, poemId]);

    if (!rows[0]) return null;
    return mapFullPoemRowToFullPoem(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while updating poem visibility'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function updatePoemModerationStatus(
  poemId: number,
  moderationStatus: 'clean' | 'pending' | 'flagged'
): Promise<FullPoem | null> {
  const query = `
    UPDATE poems
    SET moderation_status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [moderationStatus, poemId]);

    if (!rows[0]) return null;
    return mapFullPoemRowToFullPoem(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while updating poem moderation status'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}
