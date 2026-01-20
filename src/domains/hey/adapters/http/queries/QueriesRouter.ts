import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {} from '../../schemas/index';

import { queriesServices, type QueriesServices } from './Services';

export function createQueriesRouter(services: QueriesServices) {
	return new Elysia({ prefix: '/queries' }).use(AuthPlugin);
}

export const queriesRouter = createQueriesRouter(queriesServices);
