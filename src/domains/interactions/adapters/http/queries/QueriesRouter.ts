import { Elysia, t } from 'elysia';
import { AuthPlugin } from '@AuthPlugin';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentSchema } from '../../schemas/PoemCommentSchema';

import { type QueriesRouterServices, queriesRouterServices } from './Services';
import { appErrorSchema } from '@AppError';

function createInteractionsQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/interactions' }).use(AuthPlugin).get(
		'/poems/:id/comments',
		({ params }) => {
			return services.getPoemComments({
				poemId: params.id,
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
export const interactionsQueriesRouter = createInteractionsQueriesRouter(
	queriesRouterServices,
);
