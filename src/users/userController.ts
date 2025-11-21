import { AppError } from '../utils/AppError.ts';
import { insertUser, selectUser } from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import type { NewUser, User } from './userTypes';
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

  return {
    token,
    user: {
      id: user.id,
      nickname: user.nickname,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      bio: user.bio,
      status: user.status,
      avatarId: user.avatarId,
      personalityId: user.personalityId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
    },
  };
}

export async function authenticateUser(token: string): Promise<User> {
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid token'],
    });
  }

  const user = await selectUser(payload.email);

  if (!user) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }

  return user;
}
