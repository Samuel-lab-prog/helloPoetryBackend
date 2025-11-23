import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.ts';
import { mapFullUserToUser } from './userTypes';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import {
  insertUser,
  selectUserByEmail,
  selectUserById,
  updateUserLastLogin,
  updateUser,
  updateUserStatus,
  deleteUser,
} from './userModel';
import type { FullUser, NewUser, UpdateUser, User } from './userTypes';
// Additional import for poem retrieval
import {
  selectPoemsByUserId,
  selectPoemById,
  updatePoemVisibility,
  deletePoem
} from '../poems/poemModel';
import { type Poem, type FullPoem, mapFullPoemToPoem } from '../poems/poemTypes';

function ensureUserExists(user: FullUser | null): void {
  if (!user) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
}

function ensureUserNotDeleted(user: FullUser | null): void {
  if (user?.deletedAt) {
    throw new AppError({
      statusCode: 410,
      errorMessages: ['User has been deleted'],
    });
  }
}

export async function registerUser(body: NewUser): Promise<Pick<User, 'id'>> {
  const passwordHash = await bcrypt.hash(
    body.password,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10
  );

  return await insertUser({
    ...body,
    password: passwordHash,
  });
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const user = await selectUserByEmail(body.email);
  ensureUserExists(user);
  ensureUserNotDeleted(user);

  if (!(await bcrypt.compare(body.password, user!.passwordHash))) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }

  const token = generateToken({
    id: user!.id,
    email: user!.email,
  } as Payload);
  const newUser = await updateUserLastLogin(user!.id);
  ensureUserExists(newUser);
  return { token, user: mapFullUserToUser(newUser!) };
}
export async function setUserInfo(userId: number, updateData: UpdateUser): Promise<User> {
  const updatedUser = await updateUser(userId, updateData);
  ensureUserExists(updatedUser);
  ensureUserNotDeleted(updatedUser);
  return mapFullUserToUser(updatedUser!);
}
export async function authenticateUser(token: string): Promise<User> {
  const payload = verifyToken(token) as Payload;
  const user = await selectUserById(payload.id);
  ensureUserExists(user);
  ensureUserNotDeleted(user);
  return mapFullUserToUser(user!);
}

export async function setUserStatus(userId: number, status: string): Promise<User> {
  const updatedUser = await updateUserStatus(userId, status);
  ensureUserExists(updatedUser);
  ensureUserNotDeleted(updatedUser);
  return mapFullUserToUser(updatedUser!);
}

export async function removeUser(userId: number): Promise<User> {
  const deletedUser = await deleteUser(userId);
  ensureUserExists(deletedUser);
  return mapFullUserToUser(deletedUser!);
}

export async function isCollaborator(userId: number): Promise<User> {
  const user = await selectUserById(userId);
  ensureUserExists(user);
  ensureUserNotDeleted(user);
  const isCollaborator = user!.role === 'collaborator' || user!.role === 'admin';
  if (!isCollaborator) {
    throw new AppError({
      statusCode: 403,
      errorMessages: ['User is not a collaborator'],
    });
  }
  return mapFullUserToUser(user!);
}

// All functions below relate to retrieving user poems
// Since the user must be authenticated to call these functions, we can assume the user exists and is not deleted.
function ensurePoemExists(poem: FullPoem | null): void {
  if (!poem) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Poem not found'],
    });
  }
}
function ensurePoemIsNotDeleted(poem: FullPoem | null): void {
  if (poem?.deletedAt) {
    throw new AppError({
      statusCode: 410,
      errorMessages: ['Poem has been deleted'],
    });
  }
}

function ensurePoemBelongsToUser(poem: FullPoem, userId: number): void {
  if (poem.userId !== userId) {
    throw new AppError({
      statusCode: 403,
      errorMessages: ['Poem does not belong to user'],
    });
  }
}

export async function getUserPoems(userId: number): Promise<Poem[]> {
  const poems = await selectPoemsByUserId(userId);
  const filteredPoems = poems.filter(poem => !poem.deletedAt);
  return filteredPoems.map(mapFullPoemToPoem);
}

export async function getUserPoemById(userId: number, poemId: number): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);
  return mapFullPoemToPoem(poem!);
}

export async function setUserPoemVisibility(
  userId: number,
  poemId: number,
  visibility: 'public' | 'private' | 'unlisted'
): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);

  const updatedPoem = await updatePoemVisibility(poemId, visibility);
  return mapFullPoemToPoem(updatedPoem!);
}

export async function deleteUserPoem(userId: number, poemId: number): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);
  const deletedPoem = await deletePoem(poemId);
  return mapFullPoemToPoem(deletedPoem!);
}