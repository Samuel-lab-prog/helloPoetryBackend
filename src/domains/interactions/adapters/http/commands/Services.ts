import { commandsRepository } from '../../../infra/commands-repository/Repository';
import type { PoemLike } from '../../../use-cases/commands/models/Index';
import { likePoemFactory, unlikePoemFactory } from '../../../use-cases/commands/Index';
import { poemsContract } from '@Domains/poems-management/contracts/Index';

export interface CommandsRouterServices {
	likePoem(params: { userId: number; poemId: number }): Promise<PoemLike>;
	unlikePoem(params: { userId: number; poemId: number }): Promise<PoemLike>;
}

export const commandsRouterServices: CommandsRouterServices = {
	likePoem: likePoemFactory({ commandsRepository, poemsContract }),
	unlikePoem: unlikePoemFactory({ commandsRepository, poemsContract }),
};
