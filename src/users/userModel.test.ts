// IMPORTANT!!
// Missing test in updateUser --> Should troeow AppError when updating
// to an existing nickname

import { describe, it, expect, beforeEach } from 'bun:test';
import { pool } from '../db/connection.ts';
import { insertUser, selectUser, updateUser, updateUserLastLogin } from './userModel';
import type { NewUser } from './userTypes.ts';
import { AppError } from '../utils/AppError.ts';

const TEST_USER_1: NewUser = {
  nickname: 'testuser',
  fullName: 'Test User',
  email: 'testuser@example.com',
  password: 'securepassword',
  bio: 'This is a test user',
  avatarId: 1,
  personalityId: 1,
};

const TEST_USER_2: NewUser = {
  nickname: 'testuser2',
  fullName: 'Test User 2',
  email: 'testuser2@example.com',
  password: 'securepassword2',
  bio: 'Another test user',
  avatarId: 2,
  personalityId: 2,
};

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY;');
  await insertUser(TEST_USER_1);
});

describe('User Model Tests', () => {
  it('insertUser → Should insert and return an id', async () => {
    const result = await insertUser(TEST_USER_2);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });
  it('insertUser → Should throw AppError for duplicated email', async () => {
    await expect(
      insertUser({
        nickname: 'unique',
        fullName: 'Unique',
        email: TEST_USER_1.email,
        password: 'pass',
      })
    ).rejects.toThrow(AppError);
  });
  it('insertUser → Should throw AppError for duplicated nickname', async () => {
    await expect(
      insertUser({
        nickname: TEST_USER_1.nickname,
        fullName: 'Another',
        email: 'uniqueemail@example.com',
        password: 'pass',
      })
    ).rejects.toThrow(AppError);
  });
  it('insertUser → Should handle optional fields', async () => {
    const newUser: NewUser = {
      nickname: 'optional',
      fullName: 'Optional',
      email: 'optional@example.com',
      password: 'optpass',
    };
    const created = await insertUser(newUser);
    expect(created).toHaveProperty('id');
  });
  it('selectUser → Should select by nickname', async () => {
    const user = await selectUser(undefined, undefined, TEST_USER_1.nickname);
    expect(user).not.toBeNull();
    expect(user?.nickname).toBe(TEST_USER_1.nickname);
  });
  it('selectUser → Should select by id', async () => {
    const inserted = await insertUser(TEST_USER_2);
    const user = await selectUser(undefined, inserted.id);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(inserted.id);
  });
  it('selectUser → Should select by email', async () => {
    const user = await selectUser(TEST_USER_1.email);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_USER_1.email);
  });
  it('selectUser → Should throw AppError when no parameters provided', async () => {
    await expect(selectUser()).rejects.toThrow(AppError);
  });
  it('selectUser → Should return null for nonexistent nickname', async () => {
    const user = await selectUser(undefined, undefined, 'doesntexist');
    expect(user).toBeNull();
  });
  it('selectUser → Should return null for nonexistent email', async () => {
    const user = await selectUser('noemail@example.com');
    expect(user).toBeNull();
  });
  it('selectUser → Should return null for nonexistent id', async () => {
    const user = await selectUser(undefined, 9999);
    expect(user).toBeNull();
  });
  it('updateUser → Should update fields correctly', async () => {
    const user = await selectUser(TEST_USER_1.email);
    expect(user).not.toBeNull();
    const updates = {
      fullName: 'Updated Name',
      bio: 'Updated Bio',
    };
    const updated = await updateUser(user!.id, updates);
    expect(updated).not.toBeNull();
    expect(updated?.fullName).toBe('Updated Name');
    expect(updated?.bio).toBe('Updated Bio');
    expect(updated?.email).toBe(user!.email);
    expect(updated?.id).toBe(user!.id);
  });
  it('updateUser → Should return null for nonexistent user', async () => {
    const updated = await updateUser(9999, { fullName: 'Ghost' });
    expect(updated).toBeNull();
  });
  it('updateUser → Should handle partial updates', async () => {
    const user = await selectUser(TEST_USER_1.email);
    const updated = await updateUser(user!.id, { bio: 'Partial Bio' });

    expect(updated?.bio).toBe('Partial Bio');
    expect(updated?.fullName).toBe(TEST_USER_1.fullName);
  });
  it('updateUserLastLogin → Should update lastLogin', async () => {
    const user = await selectUser(TEST_USER_1.email);
    const previous = user!.lastLogin;
    await updateUserLastLogin(user!.id);
    const updated = await selectUser(TEST_USER_1.email);
    expect(updated?.lastLogin).not.toBeNull();
    expect(updated?.lastLogin).not.toEqual(previous);
  });
});
