import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError.ts';
import {
  registerUser,
  loginUser,
  setUserInfo,
  authenticateUser,
  removeUser,
  isCollaborator,
  getUserPoems,
  getUserPoemById,
  setUserPoemVisibility,
  deleteUserPoem
} from './userController';
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  userSchema,
  tokenSchema,
} from './userSchemas';

import { poemSchema } from '../poems/poemSchemas.ts'

export const userRoutes = (app: Elysia) =>
  app.group('/users', (app) =>
    app
      .post(
        '/register',
        async ({ body, set }) => {
          const user = await registerUser(body);
          set.status = 201;
          return user;
        },
        {
          body: createUserSchema,
          response: {
            201: t.Object({ id: t.Number() }),
            400: errorSchema,
            409: errorSchema,
            410: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Register',
            description: 'Creates a new user. Returns an object with the new user ID.',
            tags: ['User'],
          },
        }
      )
      .post(
        '/login',
        async ({ body, set, cookie }) => {
          const { token, user } = await loginUser(body);

          cookie.token!.path = '/';
          cookie.token!.httpOnly = true;
          cookie.token!.sameSite = 'lax';
          cookie.token!.value = token;

          set.status = 200;
          return user;
        },
        {
          body: loginUserSchema,
          response: {
            200: userSchema,
            400: errorSchema,
            401: errorSchema,
            410: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Login',
            description:
              "Authenticates the user, returns it's info and sets a JWT token in a cookie.",
            tags: ['User'],
          },
        }
      )
      .state('userId', 0)
      .guard({
        // All routes below require login authentication
        cookie: tokenSchema,
        beforeHandle: async ({ cookie, store }) => {
          store.userId = (await authenticateUser(cookie.token.value)).id;
        }
      }
      )
      .patch(
        '/',
        async ({ body, store }) => {
          const updatedUser = await setUserInfo(store.userId, body);
          return updatedUser;
        },
        {
          body: updateUserSchema,
          response: {
            200: userSchema,
            400: errorSchema,
            409: errorSchema,
            410: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Update',
            description:
              'Updates user details for the specified user ID. Returns the updated user object.',
            tags: ['User'],
          },
        }
      )
      .delete(
        '/',
        async ({ store }) => {
          return await removeUser(store.userId);
        },
        {
          detail: {
            summary: 'Delete',
            description: 'Deletes the user with the specified ID. Returns the deleted user object.',
            tags: ['User'],
          },
          response: {
            200: userSchema,
            404: errorSchema,
            410: errorSchema,
            500: errorSchema,
          },
        }
      )
      // All routes below require collaborator authoization
      .guard({
        cookie: tokenSchema,
        beforeHandle: async ({ cookie }) => {
          const user = await authenticateUser(cookie.token.value);
          await isCollaborator(user.id);
        }
      }
      )
      .get('/poems', async ({ store }) => {
        return await getUserPoems(store.userId);
      },
        {
          response: {
            200: t.Array(poemSchema),
            403: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Get User Poems',
            description: 'Retrieves all poems created by the authenticated user.',
            tags: ['User', 'Poem'],
          },
        }
      )
      .get('/poems/:poemId', async ({ params, store }) => {
        return await getUserPoemById(store.userId, params.poemId);
      },
        {
          params: t.Object({ poemId: t.Number() }),
          response: {
            200: poemSchema,
            403: errorSchema,
            410: errorSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Get User Poem By ID',
            description: 'Retrieves a specific poem created by the authenticated user.',
            tags: ['User', 'Poem'],
          },
        }
      )
      .patch('/poems/:poemId/visibility', async ({ params, body, store }) => {
        return await setUserPoemVisibility(store.userId, params.poemId, body.visibility);
      },
        {
          params: t.Object({ poemId: t.Number() }),
          body: t.Object({ visibility: t.UnionEnum(['public', 'private', 'unlisted']) }),
          response: {
            200: poemSchema,
            403: errorSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Set User Poem Visibility',
            description: 'Sets the visibility of a specific poem created by the authenticated user.',
            tags: ['User', 'Poem'],
          },
        }
      )
      .delete('/poems/:poemId', async ({ params, store }) => {
        return await deleteUserPoem(store.userId, params.poemId);
      },
        {
          params: t.Object({ poemId: t.Number() }),
          response: {
            200: poemSchema,
            403: errorSchema,
            410: errorSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Delete User Poem',
            description: 'Deletes a specific poem created by the authenticated user.',
            tags: ['User', 'Poem'],
          },
        }
      )
  );
