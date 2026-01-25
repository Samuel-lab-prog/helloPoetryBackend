import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemLikeSchema } from '../../schemas/PoemLikeSchema';

import {
	type CommandsRouterServices,
	commandsRouterServices,
} from './Services';
import { appErrorSchema } from '@AppError';

function createInteractionsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/interactions' })
		.use(AuthPlugin)
		.post(
			'/poems/:id/like',
			({ auth, params }) => {
				return services.likePoem({
					userId: auth.clientId,
					poemId: Number(params.id),
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: PoemLikeSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Like Poem',
					description: 'Adds a like to a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
    .delete(
      '/poems/:id/like',
      ({ auth, params }) => {
        return services.unlikePoem({
          userId: auth.clientId,
          poemId: Number(params.id),
        });
      },
      {
        params: t.Object({
          id: idSchema,
        }),
        response: {
          200: PoemLikeSchema,
          404: appErrorSchema,
        },
        detail: {
          summary: 'Unlike Poem',
          description: 'Removes a like from a poem by the authenticated user.',
          tags: ['Interactions'],
        },
      },
    );
}
export const interactionsCommandsRouter = createInteractionsCommandsRouter(
	commandsRouterServices,
);
