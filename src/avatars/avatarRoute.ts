import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError';
import { avatarSchema } from './avatarSchemas';
import { getAvatars } from './avatarController';
export const avatarRoutes = (app: Elysia) =>
  app
    .get(
      '/avatars',
      async () => {
        return await getAvatars();
      },
      {
        response: {
          200: t.Array(avatarSchema),
          500: errorSchema,
        },
        detail: {
          summary: 'Get all avatars',
          description: 'Retrieves a list of all available avatars, with each one having name, id and path to access in the public folder.',
          tags: ['Avatar'],
        },
      }
    )
