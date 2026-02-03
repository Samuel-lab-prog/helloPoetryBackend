import type {
	InsertPoem,
	UpdatePoem,
	PoemInsertResult,
} from '../use-cases/commands/models/Index';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertPoem(poem: InsertPoem): Promise<CommandResult<PoemInsertResult>>;
	updatePoem(
		poemId: number,
		poem: UpdatePoem & { slug: string },
	): Promise<CommandResult<UpdatePoem>>;
}
