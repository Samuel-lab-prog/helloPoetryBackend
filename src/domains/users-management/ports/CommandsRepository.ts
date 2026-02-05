import type {
	InsertUser,
	UpdateUserData,
} from '../use-cases/commands/models/Index';
import type { FullUser } from '../use-cases/queries/models/FullUser';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertUser(user: InsertUser): Promise<CommandResult<FullUser>>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<CommandResult<FullUser>>;
	softDeleteUser(id: number): Promise<CommandResult<FullUser>>;
}
