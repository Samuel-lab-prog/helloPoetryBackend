import type { PoemLike, PoemComment } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	existsPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;

	findPoemLike(params: {
		userId: number;
		poemId: number;
	}): Promise<PoemLike | null>;

	createPoemLike(params: { userId: number; poemId: number }): Promise<PoemLike>;
	deletePoemLike(params: { userId: number; poemId: number }): Promise<PoemLike>;
	createPoemComment(params: {
		userId: number;
		poemId: number;
		content: string;
	}): Promise<PoemComment>;
	deletePoemComment(params: { commentId: number }): Promise<void>;
}
