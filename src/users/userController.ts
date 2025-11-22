import { AppError } from '../utils/AppError.ts';
import {
  insertUser,
  selectUser,
  updateUserLastLogin,
  updateUser
} from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import type { NewUser, User } from './userTypes';
import { mapFullUserToUser } from './userTypes';
import bcrypt from 'bcryptjs';

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

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  } as Payload);
  const newUser = await updateUserLastLogin(user.id);
  if (!newUser) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update last login'],
    });
  }
  return { token, user: mapFullUserToUser(newUser) };
}
export async function updateUserInfo(
  userId: number,
  updateData: Partial<NewUser>): Promise<User> {
  const updatedUser = await updateUser(userId, updateData);
  if (!updatedUser) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update user'],
    });
  }

  return updatedUser;
}
export async function authenticateUser(token: string): Promise<User> {
  const payload = verifyToken(token) as Payload;
  const user = await selectUser(undefined, payload.id);

  if (!user) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid token: user not found'],
    });
  }

  return mapFullUserToUser(user);
}