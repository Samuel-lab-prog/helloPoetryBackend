import type { PoemComment } from '../use-cases/commands/models/Index';

export interface QueriesRepository {
	selectCommentById(params: { commentId: number }): Promise<PoemComment | null>;
}
