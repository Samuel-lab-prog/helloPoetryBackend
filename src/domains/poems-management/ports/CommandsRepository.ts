import type {
	InsertPoemDB,
	UpdatePoem,
	PoemCreationResult,
	UpdatePoemResult,
} from '../use-cases/commands/Models';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertPoem(poem: InsertPoemDB): Promise<CommandResult<PoemCreationResult>>;
	updatePoem(
		poemId: number,
		poem: UpdatePoem & { slug: string },
	): Promise<CommandResult<UpdatePoemResult>>;
}
