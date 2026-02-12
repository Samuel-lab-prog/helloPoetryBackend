import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentSchema } from '../ports/schemas/PoemCommentSchema';

import { type QueriesRouterServices } from '../ports/Queries';
import { appErrorSchema } from '@AppError';

export function createInteractionsQueriesRouter(
	services: QueriesRouterServices,
) {
	return new Elysia({ prefix: '/interactions' }).use(AuthPlugin).get(
		'/poems/:id/comments',
		({ params, auth }) => {
			return services.getPoemComments({
				poemId: params.id,
				userId: auth.clientId,
			});
		},
		{
			params: t.Object({
				id: idSchema,
			}),
			response: {
				200: t.Array(PoemCommentSchema),
				404: appErrorSchema,
				409: appErrorSchema,
			},
			detail: {
				summary: 'Get Poem Comments',
				description: 'Retrieves comments for a poem.',
				tags: ['Interactions'],
			},
		},
	);
}
