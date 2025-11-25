import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError.ts';

import {
  registerPoem,
  getPoemsByUserId,
  getUserPoemById,
  setUserPoemVisibility,
  deleteUserPoem
} from './services.ts';

import {
  poemSchema,
  postPoemSchema,
  poemVisibilityField
} from './schemas.ts';

import {
  authenticateUser,
  isCollaborator
} from '../users/services.ts';

import { tokenSchema } from '../users/schemas.ts';

export const poemRouter = (app: Elysia) =>
  app.group('/users', (app) =>
    app.group('/poems', (app) =>
      app
        .state('userId', 0)
        .guard({ // All poem routes require authentication and collaborator authorization
          cookie: tokenSchema,
          beforeHandle: async ({ cookie, store }) => {
            const user = await authenticateUser(cookie.token.value);
            store.userId = user.id;
            await isCollaborator(user.id);

          }
        }
        )
        .post(
          '/',
          async ({ body, set, store }) => {
            const poem = await registerPoem(body, store.userId);
            set.status = 201;
            return poem;
          },
          {
            body: postPoemSchema,
            response: {
              201: t.Object({ id: t.Number() }),
              400: errorSchema,
              500: errorSchema
            },
            detail: {
              summary: 'Register a new Poem',
              description: 'Creates a new poem entry for the authenticated user.',
              tags: ['Poem'],
            }

          }
        )
        .get(
          '/',
          async ({ store }) => {
            return await getPoemsByUserId(store.userId);
          },
          {
            response: {
              200: t.Array(poemSchema),
              400: errorSchema,
              404: errorSchema,
              500: errorSchema
            },
            detail: {
              summary: 'Get Poems by User ID',
              description: 'Retrieves all poems for the authenticated user.',
              tags: ['Poem'],
            }
          }
        )
        .get(
          '/:poemId',
          async ({ store, params }) => {
            return await getUserPoemById(store.userId, params.poemId);
          },
          {
            params: t.Object({
              poemId: t.Numeric()
            }),
            response: {
              200: poemSchema,
              400: errorSchema,
              403: errorSchema,
              404: errorSchema,
              410: errorSchema,
              500: errorSchema
            },
            detail: {
              summary: 'Get User Poem by ID',
              description: 'Retrieves a specific poem by its ID for the authenticated user.',
              tags: ['Poem'],
            }
          }
        )
        .patch(
          '/:poemId/visibility',
          async ({ store, params, body }) => {
            return await setUserPoemVisibility(
              store.userId,
              params.poemId,
              body.visibility as 'public' | 'private' | 'unlisted'
            );
          },
          {
            params: t.Object({
              poemId: t.Numeric()
            }),
            body: t.Object({
              visibility: poemVisibilityField
            }),
            response: {
              200: poemSchema,
              400: errorSchema,
              403: errorSchema,
              404: errorSchema,
              410: errorSchema,
              500: errorSchema
            },
            detail: {
              summary: 'Set User Poem Visibility',
              description: 'Updates the visibility status of a specific poem for the authenticated user.',
              tags: ['Poem'],
            }

          }
        )
        .delete(
          '/:poemId',
          async ({ store, params }) => {
            return await deleteUserPoem(
              store.userId,
              params.poemId
            );
          },
          {
            params: t.Object({
              poemId: t.Number()
            }),
            response: {
              200: poemSchema,
              400: errorSchema,
              403: errorSchema,
              404: errorSchema,
              410: errorSchema,
              500: errorSchema
            },
            detail: {
              summary: 'Delete User Poem',
              description: 'Deletes a specific poem for the authenticated user.',
              tags: ['Poem'],
            }
          }
        )
    )
  );
