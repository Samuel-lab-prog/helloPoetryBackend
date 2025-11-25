import { describe, it, expect, beforeEach } from 'bun:test';
import { pool } from '../db/connection.ts';
import {
  insertPoem,
  selectPoemById,
  selectPoemsByUserId,
  updatePoemStatus,
  deletePoem,
  updatePoemVisibility,
  updatePoemModerationStatus,
} from './models.ts';

import type { InsertPoem } from './types.ts';
import { AppError } from '../utils/AppError.ts';
import { insertUser } from '../users/models.ts';


const DEFAULT_USER = {
  nickname: 'poetuser',
  fullName: 'Poet User',
  email: 'poetuser@example.com',
  password: 'poetpassword',
};
let DEFAULT_USER_ID: number; 
let DEFAULT_POEM_ID: number;
let DEFAULT_POEM: InsertPoem;
let SECOND_POEM: InsertPoem;

beforeEach(async () => {
  await pool.query('DELETE FROM poem_tags;');
  await pool.query('DELETE FROM poems;');
  await pool.query('DELETE FROM users;');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
  await pool.query('ALTER SEQUENCE poems_id_seq RESTART WITH 1;');

  DEFAULT_USER_ID = (await insertUser(DEFAULT_USER)).id;

  DEFAULT_POEM = {
    title: 'My Poem',
    content: 'Some great poem content',
    userId: DEFAULT_USER_ID,
    slug: 'my-poem',
  };
  SECOND_POEM = {
    title: 'Another Poem',
    content: 'More content',
    userId: DEFAULT_USER_ID,
    slug: 'another-poem',
  };
  DEFAULT_POEM_ID = (await insertPoem(DEFAULT_POEM)).id;
  
});


describe('Poem Model Tests', () => {

  it('insertPoem → Should insert and return an id', async () => {
    const result = await insertPoem(SECOND_POEM);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });

  it('insertPoem → Should throw AppError for duplicated slug', async () => {
    const result = insertPoem({ ...SECOND_POEM, slug: DEFAULT_POEM.slug });
    expect(result).rejects.toThrow(AppError);
  });

  it('selectPoemById → Should return poem correctly', async () => {
    const poem = await selectPoemById(DEFAULT_POEM_ID);
    expect(poem).not.toBeNull();
    expect(poem?.id).toBe(DEFAULT_POEM_ID);
  });

  it('selectPoemById → Should return null for nonexistent poem', async () => {
    const poem = await selectPoemById(9999);
    expect(poem).toBeNull();
  });

  it('selectPoemsByUserId → Should return multiple poems for user', async () => {
    await insertPoem(SECOND_POEM);
    const poems = await selectPoemsByUserId(DEFAULT_USER_ID);
    expect(poems.length).toBeGreaterThanOrEqual(2);
  });

  it('selectPoemsByUserId → Should return empty list when none exist', async () => {
    const poems = await selectPoemsByUserId(9999);
    expect(poems.length).toBe(0);
  });

  it('updatePoemStatus → Should update status and publishedAt when status is published', async () => {
    const updated = await updatePoemStatus(DEFAULT_POEM_ID, 'published');
    expect(updated).not.toBeNull();
    expect(updated?.updatedAt).not.toBeNull();
    expect(updated?.publishedAt).not.toBeNull();
    expect(updated?.status).toBe('published');
  });

  it('updatePoemStatus → Should update status without changing publishedAt when status is draft', async () => {
    await updatePoemStatus(DEFAULT_POEM_ID, 'published');
    const updated = await updatePoemStatus(DEFAULT_POEM_ID, 'draft');
    expect(updated).not.toBeNull();
    expect(updated?.updatedAt).not.toBeNull();
    expect(updated?.publishedAt).toBeNull();
    expect(updated?.status).toBe('draft');
  });

  it('updatePoemStatus → Should return null for nonexistent poem', async () => {
    const updated = await updatePoemStatus(9999, 'published');
    expect(updated).toBeNull();
  });

  it('updatePeomVisibility → Should return null for nonexistent poem', async () => {
    const deleted = await deletePoem(9999);
    expect(deleted).toBeNull();
  });

  it('updatePeomVisibility → Should change visibility correctly', async () => {
    const updated = await updatePoemVisibility(DEFAULT_POEM_ID, 'private');
    expect(updated).not.toBeNull();
    expect(updated?.visibility).toBe('private');
    const updatedAgain = await updatePoemVisibility(DEFAULT_POEM_ID, 'unlisted');
    expect(updatedAgain).not.toBeNull();
    expect(updatedAgain?.visibility).toBe('unlisted');
  });

  it('updatePeomModerationStatus → Should return null for nonexistent poem', async () => {
    const deleted = await deletePoem(9999);
    expect(deleted).toBeNull();
  });

  it('updatePeomModerationStatus → Should change moderation status correctly', async () => {
    const updated = await updatePoemModerationStatus(DEFAULT_POEM_ID, 'clean');
    expect(updated).not.toBeNull();
    expect(updated?.moderationStatus).toBe('clean');
    const updatedAgain = await updatePoemModerationStatus(DEFAULT_POEM_ID, 'flagged');
    expect(updatedAgain).not.toBeNull();
    expect(updatedAgain?.moderationStatus).toBe('flagged');
  });

  it('deletePoem → Should return null for nonexistent poem', async () => {
    const deleted = await deletePoem(9999);
    expect(deleted).toBeNull();
  });

  it('deletePoem → Should soft delete poem correctly', async () => {
    await deletePoem(DEFAULT_POEM_ID);
    const deleted = await selectPoemById(DEFAULT_POEM_ID);
    expect(deleted?.deletedAt).not.toBeNull();
  });

});
