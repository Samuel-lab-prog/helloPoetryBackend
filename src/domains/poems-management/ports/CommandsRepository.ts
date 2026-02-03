import type {
	CreatePoemDB,
	UpdatePoemDB,
	CreatePoemResult,
	UpdatePoemResult,
} from '../use-cases/commands/Models';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertPoem(poem: CreatePoemDB): Promise<CommandResult<CreatePoemResult>>;
	updatePoem(poemId: number, poem: UpdatePoemDB): Promise<CommandResult<UpdatePoemResult>>;
}
