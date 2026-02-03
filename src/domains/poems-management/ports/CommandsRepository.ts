import type {
	CreatePoemDB,
	UpdatePoemDB,
	CreatePoemResult,
	UpdatePoemResult,
} from '../use-cases/commands/Models';
import type { CommandResult } from '@SharedKernel/Types';

type PoemCreationParams = { poem: CreatePoemDB };
type UpdatePoemParams = {
	poemId: number;
	poem: UpdatePoemDB;
};

export interface CommandsRepository {
	insertPoem(
		params: PoemCreationParams,
	): Promise<CommandResult<CreatePoemResult>>;
	updatePoem(
		params: UpdatePoemParams,
	): Promise<CommandResult<UpdatePoemResult>>;
}
