import { userSchema, createUserSchema, updateUserSchema, loginUserSchema } from './userSchemas';

export type FullUserRow = {
  id: number;
  nickname: string;
  email: string;
  password_hash: string;

  full_name: string | null;
  bio: string | null;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'admin' | 'collaborator';

  avatar_id: number;
  personality_id: number;

  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  last_login: Date | null;

  reset_token: string | null;
  reset_token_expires: Date | null;

  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
};

export type User = (typeof userSchema)['static'];
export type NewUser = (typeof createUserSchema)['static'];
export type LoginUser = (typeof loginUserSchema)['static'];
export type UpdateUser = (typeof updateUserSchema)['static'];

export type FullUser = User & {
  deletedAt: Date | null;
  resetToken: string | null;
  resetTokenExpires: Date | null;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordHash: string;
};

export function mapFullUserRowToFullUser(row: FullUserRow): FullUser {
  return {
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    status: row.status,
    role: row.role,

    bio: row.bio ? row.bio : null,
    fullName: row.full_name ? row.full_name : null,
    avatarId: row.avatar_id,
    personalityId: row.personality_id,

    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    lastLogin: row.last_login ? new Date(row.last_login) : null,
    emailVerified: row.email_verified,
    passwordHash: row.password_hash,
    resetToken: row.reset_token,
    resetTokenExpires: row.reset_token_expires ? new Date(row.reset_token_expires) : null,
    emailVerificationToken: row.email_verification_token,
    emailVerificationExpires: row.email_verification_expires
      ? new Date(row.email_verification_expires)
      : null,
  };
}

export function mapFullUserToUser(user: FullUser): User {
  return {
    id: user.id,
    nickname: user.nickname,
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    bio: user.bio,
    role: user.role,
    avatarId: user.avatarId,
    personalityId: user.personalityId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    emailVerified: user.emailVerified,
  };
}
