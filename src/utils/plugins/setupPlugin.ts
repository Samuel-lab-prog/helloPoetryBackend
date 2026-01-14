import Elysia from 'elysia';
import { appErrorSchema } from '../AppError';
import { log } from '../logger';

export const SetupPlugin = new Elysia()
	.as('global')
	.decorate('auth', {
		clientId: -1,
		clientRole: '',
	})
	.decorate('logger', {
		log,
	})
	.state('reqInitiatedAt', 0)
	.state('authTiming', 0)
	.state('reqId', '')
	.guard({
		as: 'scoped',
		response: {
			500: appErrorSchema,
		},
	});

export type SetupPluginType = {
	clientId: number | null;
	clientRole: string;
	reqInitiatedAt: number;
	authTiming: number;
	reqId: string;
};
