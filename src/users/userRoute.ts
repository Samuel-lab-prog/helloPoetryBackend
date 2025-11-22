import { Elysia, t } from 'elysia';
import { errorSchema } from '../utils/AppError.ts';
import {
  registerUser,
  loginUser,
  setUserInfo,
} from './userController';
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  userSchema,
} from './userSchemas';

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
      .patch(
        '/:id',
        async ({ params, body }) => {
          return await setUserInfo(params.id, body);
        },
        {
          body: updateUserSchema,
          params: t.Object({ id: t.Number() }),
          response: {
            200: userSchema,
            400: errorSchema,
            409: errorSchema,
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
      .delete('/:id', () => {
        // To be implemented
      }, {
        params: t.Object({ id: t.Number() }),
        detail: {
          summary: 'Delete',
          description: 'Deletes the user with the specified ID. (Not yet implemented)',
          tags: ['User'],
        },
        responses: {
          204: t.Void(),
          404: errorSchema,
          500: errorSchema
        }
      })
  );
