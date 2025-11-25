import {
  poemSchema,
  postPoemSchema,
  insertPoemSchema
} from './schemas';

export type FullPoemRow = {
  id: number;
  title: string;
  content: string;
  user_id: number;
  slug: string;

  moderation_status: 'clean' | 'pending' | 'flagged';
  visibility: 'public' | 'private' | 'unlisted';
  status: 'draft' | 'published';

  likes_count: number;

  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  published_at: Date | null;
};

export type Poem = (typeof poemSchema)['static'];
export type NewPoem = (typeof postPoemSchema)['static'];
export type InsertPoem = (typeof insertPoemSchema)['static'];

export type FullPoem = Poem & {
  userId: number;
  moderationStatus: 'clean' | 'pending' | 'flagged';
  likesCount: number;
  slug: string;
  deletedAt: Date | null;
  publishedAt: Date | null;
};

export function mapFullPoemRowToFullPoem(row: FullPoemRow): FullPoem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    userId: row.user_id,
    slug: row.slug,

    moderationStatus: row.moderation_status,
    visibility: row.visibility,
    status: row.status,
    likesCount: row.likes_count,

    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null
  };
}

export function mapFullPoemToPoem(poem: FullPoem): Poem {
  return {
    id: poem.id,
    title: poem.title,
    content: poem.content,
    userId: poem.userId,
    slug: poem.slug,

    moderationStatus: poem.moderationStatus,
    visibility: poem.visibility,
    status: poem.status,
    likesCount: poem.likesCount,

    createdAt: poem.createdAt,
    updatedAt: poem.updatedAt,
    publishedAt: poem.publishedAt
  };
}