import { commandsRepository } from '../../../infra/commands-repository/Repository';
import type { PoemLike } from '../../../use-cases/commands/models/Index';
import { likePoemFactory } from '../../../use-cases/commands/Index';

export interface CommandsRouterServices {
	likePoem(params: { userId: number; poemId: number }): Promise<PoemLike>;
}

export const commandsRouterServices: CommandsRouterServices = {};
