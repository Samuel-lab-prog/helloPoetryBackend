import Elysia from 'elysia';

export const SetupPlugin = new Elysia()
	.as('global')
	.state('clientId', null as number | null) // If we have the id, we guarantee authentication
	.state('clientRole', 'user' as 'user' | 'author' | 'moderator')
	.state('reqInitiatedAt', 0)
	.state('authTiming', 0) // This is being instanciated in login and authPlugin
	.state('reqId', '');

export type SetupPluginType = {
	clientId: number | null;
	clientRole: 'user' | 'author' | 'moderator';
	reqInitiatedAt: number;
	authTiming: number;
	reqId: string;
};
