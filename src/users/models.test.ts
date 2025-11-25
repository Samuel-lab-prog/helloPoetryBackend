// IMPORTANT!!
// Missing test in updateUser --> Should troeow AppError when updating
// to an existing nickname

import { describe, it, expect, beforeEach } from 'bun:test';
import { pool } from '../db/connection.ts';
import {
  insertUser,
  selectUserByEmail,
  selectUserById,
  selectUserByNickname,
  updateUser,
  updateUserLastLogin,
  updateUserStatus,
  deleteUser,
} from './models.ts';
import type { NewUser } from './types.ts';
import { AppError } from '../utils/AppError.ts';

const DEFAULT_USER: NewUser = {
  nickname: 'testuser',
  fullName: 'Test User',
  email: 'testuser@example.com',
  password: 'securepassword',
  bio: 'This is a test user',
  avatarId: 1,
  personalityId: 1,
};

let DEFAULT_USER_ID: number;

const NEW_USER: NewUser = {
  nickname: 'testuser2',
  fullName: 'Test User 2',
  email: 'testuser2@example.com',
  password: 'securepassword2',
  bio: 'Another test user',
  avatarId: 2,
  personalityId: 2,
};

beforeEach(async () => {
  await pool.query('DELETE FROM users;');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
  DEFAULT_USER_ID = (await insertUser(DEFAULT_USER)).id;
});

describe('User Model Tests', () => {
  it('insertUser → Should insert and return an id', async () => {
    const result = await insertUser(NEW_USER);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });
  it('insertUser → Should throw AppError for duplicated email', async () => {
   expect(
      insertUser({
        nickname: 'unique',
        fullName: 'Unique',
        email: DEFAULT_USER.email,
        password: 'pass',
      })
    ).rejects.toThrow(AppError);
  });
  it('insertUser → Should throw AppError for duplicated nickname', async () => {
   expect(
      insertUser({
        nickname: DEFAULT_USER.nickname,
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
  it('selectUserByNickname → Should select by nickname', async () => {
    const user = await selectUserByNickname(DEFAULT_USER.nickname);
    expect(user).not.toBeNull();
    expect(user?.nickname).toBe(DEFAULT_USER.nickname);
  });
  it('selectUserById → Should select by id', async () => {
    const user = await selectUserById(DEFAULT_USER_ID);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(DEFAULT_USER_ID);
  });
  it('selectUserByEmail → Should select by email', async () => {
    const user = await selectUserByEmail(DEFAULT_USER.email);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(DEFAULT_USER.email);
  });
  it('selectUserByNickname → Should return null for nonexistent nickname', async () => {
    const user = await selectUserByNickname('doesntexist');
    expect(user).toBeNull();
  });
  it('selectUserByEmail → Should return null for nonexistent email', async () => {
    const user = await selectUserByEmail('noemail@example.com');
    expect(user).toBeNull();
  });
  it('selectUserById → Should return null for nonexistent id', async () => {
    const user = await selectUserById(9999);
    expect(user).toBeNull();
  });
  it('updateUser → Should update fields correctly', async () => {
    const user = await selectUserByEmail(DEFAULT_USER.email);
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
    const user = await selectUserByEmail(DEFAULT_USER.email);
    const updated = await updateUser(user!.id, { bio: 'Partial Bio' });

    expect(updated?.bio).toBe('Partial Bio');
    expect(updated?.fullName).toBe(DEFAULT_USER.fullName);
  });
  it('updateUserLastLogin → Should update lastLogin', async () => {
    const user = await selectUserByEmail(DEFAULT_USER.email);
    const previous = user!.lastLogin;
    await updateUserLastLogin(user!.id);
    const updated = await selectUserByEmail(DEFAULT_USER.email);
    expect(updated?.lastLogin).not.toBeNull();
    expect(updated?.lastLogin).not.toEqual(previous);
  });
  it('updateUserStatus → Should update status correctly', async () => {
    const user = await selectUserByEmail(DEFAULT_USER.email);
    expect(user).not.toBeNull();
    const newStatus = 'suspended';
    await updateUserStatus(user!.id, newStatus);
    const newUserCheck = await selectUserByEmail(DEFAULT_USER.email);
    expect(newUserCheck?.status).toBe(newStatus);
  });
  it('updateUserStatus → Should return null for nonexistent user', async () => {
    const updated = await updateUserStatus(9999, 'active');
    expect(updated).toBeNull();
  });
  it('deleteUser → Should soft delete user correctly', async () => {
    const user = await selectUserByEmail(DEFAULT_USER.email);
    expect(user).not.toBeNull();
    await deleteUser(user!.id);
    const deletedUser = await selectUserByEmail(DEFAULT_USER.email);
    expect(deletedUser?.deletedAt).not.toBeNull();
  });
  it('deleteUser → Should return null for nonexistent user', async () => {
    const deleted = await deleteUser(9999);
    expect(deleted).toBeNull();
  });
});
