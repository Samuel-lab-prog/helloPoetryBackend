import Elysia from 'elysia';
import { appErrorSchema } from '../AppError';
import { log } from '../Logger';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

type AuthType = {
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};
export const SetupPlugin = new Elysia()
	.as('global')
	.decorate('auth', {
		clientId: -1,
		clientRole: 'author',
		clientStatus: 'banned',
	} as AuthType satisfies AuthType)
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

export type SetupPluginContext = {
	auth: AuthType;
	store: {
		reqInitiatedAt: number;
		authTiming: number;
		reqId: string;
	};
};
