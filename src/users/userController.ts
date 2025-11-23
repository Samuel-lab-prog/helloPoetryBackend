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
import { selectPoemsByUserId } from '../poems/poemModel';
import { type Poem, mapFullPoemToPoem } from '../poems/poemTypes';

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

export async function getUserPoems(userId: number) : Promise<Poem[]> {
  const poems = await selectPoemsByUserId(userId);
  return poems.map(mapFullPoemToPoem);
}
