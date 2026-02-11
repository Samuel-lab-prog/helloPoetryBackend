import type {
	CreateUserDB,
	UpdateUserData,
	FullUser,
} from '../../use-cases/Models';
import type { CommandResult } from '@SharedKernel/Types';

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<FullUser>>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<CommandResult<FullUser>>;
	softDeleteUser(id: number): Promise<CommandResult<FullUser>>;
}
