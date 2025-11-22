import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError';
import { personalitySchema } from './personalitySchemas';
import { getPersonalities } from './personalityController';
export const personalityRoutes = (app: Elysia) =>
  app.get(
    '/personalities',
    async () => {
      return await getPersonalities();
    },
    {
      response: {
        200: t.Array(personalitySchema),
        500: errorSchema,
      },
      detail: {
        summary: 'Get all personalities',
        description: 'Retrieves a list of all available personalities.',
        tags: ['Personality'],
      },
    }
  );
