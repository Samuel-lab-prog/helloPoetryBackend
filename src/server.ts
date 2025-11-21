import {Elysia,  redirect} from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { handleError } from './middlewares/handleError';
import { xssClean } from './middlewares/xssClean';
import { userRoutes } from './users/userRoute';
import { avatarRoutes } from './avatars/avatarRoute';

new Elysia()
  .onError(async ({ error, set }) => handleError(set, error))
  .use(cors())
  .onBeforeHandle((ctx) => xssClean(ctx))
  .use(staticPlugin())
  .use(userRoutes)
  .use(avatarRoutes)
  .use(
    openapi({
      path: '/docs',
      documentation: {
        info: {
          title: 'Hello Poetry API',
          description: 'API documentation for my personal Hello Poetry API',
          version: '1.0.0',
        },
      },
    })
  )
  .get('/', () => redirect('/docs'))
  .listen({
    port: Number(process.env.PORT) || 3000,
    hostname: '0.0.0.0',
  });

console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
