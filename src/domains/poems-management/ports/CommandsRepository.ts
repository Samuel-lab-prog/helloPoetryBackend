import type {
	InsertPoemDB,
	UpdatePoem,
	PoemCreationResult,
	UpdatePoemResult,
} from '../use-cases/commands/Models';
import type { CommandResult } from '@SharedKernel/Types';

type PoemCreationParams = { poem: InsertPoemDB; };
type UpdatePoemParams = {	
	poemId: number;
	poem: UpdatePoem & { slug: string };
};

export interface CommandsRepository {
	insertPoem(params: PoemCreationParams): Promise<CommandResult<PoemCreationResult>>;
	updatePoem(params: UpdatePoemParams): Promise<CommandResult<UpdatePoemResult>>;
}
