import type { InsertPoem } from '../use-cases/commands/models/Index';

export interface CommandsRepository {
	insertPoem(poem: InsertPoem): Promise<{ id: number }>;
}
