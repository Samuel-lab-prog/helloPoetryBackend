import type {
	InsertPoem,
	PoemInsertResult,
} from '../use-cases/commands/models/Index';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertPoem(poem: InsertPoem): Promise<CommandResult<PoemInsertResult>>;
}
