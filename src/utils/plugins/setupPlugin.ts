import Elysia from 'elysia';

export const SetupPlugin = new Elysia()
	.as('global')
	.state('userId', null as number | null) // If we have the id, we guarantee authentication
	.state('role', 'user' as 'user' | 'author' | 'moderator')
	.state('reqInitiatedAt', 0)
	.state('authTiming', 0) // This is being instanciated in login and authPlugin
	.state('reqId', '');

export type SetupPluginType = {
	userId: number | null;
	role: 'user' | 'author' | 'moderator';
	reqInitiatedAt: number;
	authTiming: number;
	reqId: string;
};
