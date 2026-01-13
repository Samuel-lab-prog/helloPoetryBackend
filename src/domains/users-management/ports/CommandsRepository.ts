import type { InsertUser } from '../use-cases/commands/commands-models/Insert';
import type { UpdateUserData } from '../use-cases/commands/commands-models/Update';

export interface UserCommandsRepository {
	insertUser(user: InsertUser): Promise<{ id: number } | null>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<{ id: number } | null>;
	softDeleteUser(id: number): Promise<{ id: number } | null>;
}
