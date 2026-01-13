import Elysia from 'elysia';
import { appErrorSchema } from '../AppError';

export const SetupPlugin = new Elysia()
	.as('global')
	.state('clientId', -1)
	.state('clientRole', '')
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
