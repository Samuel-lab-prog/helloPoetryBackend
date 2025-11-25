import { t } from 'elysia';
import { AppError } from '../utils/AppError.ts';

export const idField = t.Number({
  minimum: 1,
  example: 1,
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['ID must be a valid number']
    });
  }
});

export const poemTitleField = t.String({
  minLength: 1,
  maxLength: 200,
  example: 'The Road Not Taken',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Title must be between 1 and 200 characters']
    });
  }
});

export const poemContentField = t.String({
  minLength: 1,
  example: 'Two roads diverged in a yellow wood...',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Content cannot be empty']
    });
  }
});

export const poemSlugField = t.String({
  minLength: 3,
  maxLength: 200,
  pattern: '^[a-z0-9-]+$',
  example: 'the-road-not-taken',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid slug format']
    });
  }
});

export const poemModerationStatusField = t.String({
  enum: ['clean', 'pending', 'flagged'],
  example: 'pending',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: [
        "moderation_status must be one of: 'clean', 'pending', 'flagged'"
      ]
    });
  }
});

export const poemVisibilityField = t.String({
  enum: ['public', 'private', 'unlisted'],
  example: 'public',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: [
        "visibility must be one of: 'public', 'private', 'unlisted'"
      ]
    });
  }
});

export const poemStatusField = t.String({
  enum: ['draft', 'published'],
  example: 'draft',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ["status must be one of: 'draft', 'published'"]
    });
  }
});

export const likesCountField = t.Number({
  minimum: 0,
  example: 0,
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['likes_count must be >= 0']
    });
  }
});

export const dateField = t.Date({
  coerce: true,
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid date format']
    });
  }
});

export const tagNameField = t.String({
  minLength: 1,
  maxLength: 50,
  example: 'nature',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Tag name must be between 1 and 50 characters']
    });
  }
});

export const tagsArrayField = t.Array(tagNameField, {
  minLength: 1,
  maxLength: 3,
  uniqueItems: true,
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Tags must be an array of 1 to 3 unique tag names']
    });
  }
});

export const poemSchema = t.Object({
  id: idField,
  title: poemTitleField,
  content: poemContentField,
  userId: idField,
  slug: poemSlugField,
  moderationStatus: poemModerationStatusField,
  visibility: poemVisibilityField,
  status: poemStatusField,
  likesCount: likesCountField,
  createdAt: dateField,
  updatedAt: t.Nullable(dateField),
  publishedAt: t.Nullable(dateField)
});

export const postPoemSchema = t.Object({
  title: poemTitleField,
  content: poemContentField,
  tags: t.Optional(tagsArrayField),
  visibility: t.Optional(poemVisibilityField)
});

export const insertPoemSchema = t.Object({
  title: poemTitleField,
  content: poemContentField,
  userId: idField,
  slug: poemSlugField,
});
