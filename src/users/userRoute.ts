import { Elysia, t } from 'elysia';
import { registerUser, loginUser } from './userController';
import { errorSchema } from '../utils/AppError.ts';
import { createUserSchema, loginUserSchema, userSchema } from './userSchemas';

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
            201: t.Object(
              { id: t.Number() },
            ),
            400: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Register a new user',
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
            summary: 'Login a user',
            description: 'Authenticates the user, returns it\'s info and sets a JWT token in a cookie.',
            tags: ['User'],
          },
        }
      )
  );
