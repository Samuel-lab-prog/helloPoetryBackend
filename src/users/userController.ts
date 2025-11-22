import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.ts';
import { mapFullUserToUser } from './userTypes';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import { insertUser, selectUser, updateUserLastLogin, updateUser, updateUserStatus } from './userModel';
import type { NewUser, UpdateUser, User } from './userTypes';

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
  const user = await selectUser(body.email);

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash)) || user.status === 'deleted') {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  } as Payload);
  const newUser = await updateUserLastLogin(user.id);
  if (!newUser || newUser.status === 'deleted') {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update last login'],
    });
  }
  return { token, user: mapFullUserToUser(newUser) };
}
export async function setUserInfo(userId: number, updateData: UpdateUser): Promise<User> {
  const updatedUser = await updateUser(userId, updateData);
  if (!updatedUser || updatedUser.status === 'deleted') {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update user'],
    });
  }

  return mapFullUserToUser(updatedUser);
}
export async function authenticateUser(token: string): Promise<User> {
  const payload = verifyToken(token) as Payload;
  const user = await selectUser(undefined, payload.id);

  if (!user || user.status === 'deleted') {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid token: user not found'],
    });
  }

  return mapFullUserToUser(user);
}

export async function isAdminUser(userId: number): Promise<boolean> {
  const user = await selectUser(undefined, userId);
  if (!user || user.status === 'deleted'){
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
  return user.role === 'admin';
}

export async function isCollaboratorUser(userId: number): Promise<boolean> {
  const user = await selectUser(undefined, userId);
  if (!user || user.status === 'deleted'){
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
  return user.role === 'collaborator' || user.role === 'admin';
}

export async function setUserStatus(userId: number, status: string): Promise<User> {
  const updatedUser = await updateUserStatus(userId, status);

  if (!updatedUser || updatedUser.status === 'deleted') {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }

  return mapFullUserToUser(updatedUser);
}