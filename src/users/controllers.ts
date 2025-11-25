import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError.ts';
import {
  registerUser,
  loginUser,
  setUserInfo,
  authenticateUser,
  removeUser,
} from './services.ts';
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  userSchema,
  tokenSchema,
} from './schemas.ts';


export const userRouter = (app: Elysia) =>
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
  );
