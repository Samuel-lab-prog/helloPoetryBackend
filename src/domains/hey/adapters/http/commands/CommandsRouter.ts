import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import { AuthPlugin } from '@AuthPlugin';

import {} from '../../schemas/index';

import { commandsServices, type CommandsServices } from './Services';

export function createCommandsRouter(services: CommandsServices) {
	return new Elysia({ prefix: '/commands' }).use(AuthPlugin);
}

export const commandsRouter = createCommandsRouter(commandsServices);
