import type { PoemLike } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	existsPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;

	findPoemLike(params: {
		userId: number;
		poemId: number;
	}): Promise<PoemLike | null>;

	createPoemLike(params: { userId: number; poemId: number }): Promise<PoemLike>;
}
