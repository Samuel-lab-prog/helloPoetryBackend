import { t } from 'elysia';
import { AppError } from '../utils/AppError.ts';

export const nicknameField = t.String({
  minLength: 3,
  maxLength: 30,
  example: 'hello_kitty_fan',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Nickname must be between 3 and 30 characters long'],
    });
  },
});

export const fullNameField = t.String({
  minLength: 3,
  maxLength: 50,
  example: 'Kuromi Nakamura',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Name must be between 3 and 50 characters long'],
    });
  },
});

export const emailField = t.String({
  format: 'email',
  maxLength: 100,
  example: 'kuromi@example.com',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid email format'],
    });
  },
});

export const passwordField = t.String({
  minLength: 6,
  maxLength: 30,
  example: '12345678',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Password must be between 6 and 30 characters long'],
    });
  },
});

export const bioField =
  t.String({
    maxLength: 500,
    example: 'I love chaos and mischief!',
    error() {
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Bio must have at most 500 characters'],
      });
    },
  });

export const roleField = t.String({
  enum: ['user', 'admin', 'collaborator'],
  example: 'user',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ["Role must be one of: 'user', 'admin', 'collaborator'"],
    });
  },
});

export const userStatusField = t.String({
  enum: ['active', 'suspended', 'banned', 'deleted'],
  example: 'active',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ["Status must be one of: 'active', 'suspended', 'banned', 'deleted'"],
    });
  },
});

export const dateFormat = t.Date({ coerce: true });

export const avatarIdField =
  t.Number({
    minimum: 1,
    example: 3,
    error() {
      throw new AppError({
        statusCode: 400,
        errorMessages: ['avatarId must be a valid number'],
      });
    },
  });

export const personalityIdField =
  t.Number({
    minimum: 1,
    example: 1,
    error() {
      throw new AppError({
        statusCode: 400,
        errorMessages: ['personalityId must be a valid number'],
      });
    },
  });

export const userSchema = t.Object({
  id: t.Number(),
  nickname: nicknameField,
  fullName: fullNameField,
  email: emailField,
  role: roleField,
  bio: bioField,
  avatarId: avatarIdField,
  personalityId: personalityIdField,
  status: userStatusField,
  createdAt: dateFormat,
  updatedAt: t.Nullable(dateFormat),
  lastLogin: t.Nullable(dateFormat),
  emailVerified: t.Boolean(),
});

export const createUserSchema = t.Object({
  nickname: nicknameField,
  fullName: fullNameField,
  email: emailField,
  password: passwordField,
  bio: t.Optional(bioField),
  avatarId: t.Optional(avatarIdField),
  personalityId: t.Optional(personalityIdField),
});

export const updateUserSchema = t.Partial(
  t.Object({
    nickname: nicknameField,
    fullName: fullNameField,
    bio: bioField,
    avatarId: avatarIdField,
    personalityId: personalityIdField,
  }));

export const loginUserSchema = t.Object({
  email: emailField,
  password: passwordField,
});

export const tokenSchema = t.Object({
  token: t.String({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN',
    error() {
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Valid token is required'],
      });
    }
  }),
});