import type { PoemSelect } from '@PrismaGenerated/models';

export const insertPoemSelect = {
  id: true,

  title: true,
  slug: true,
  content: true,
  excerpt: true,
  tags: true,

  isCommentable: true,
  dedications: {
    select: {
      toUserId: true,
    }
  },

  visibility: true,
  status: true,
  moderationStatus: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies PoemSelect;

export const updatePoemSelect = insertPoemSelect;