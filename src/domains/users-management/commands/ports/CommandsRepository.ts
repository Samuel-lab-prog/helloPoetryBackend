import type { InsertUser } from '../commands-models/Insert';
import type { UpdateUserData } from '../commands-models/Update';

export interface UserCommandsRepository {
	insertUser(user: InsertUser): Promise<{ id: number } | null>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<{ id: number } | null>;
	softDeleteUser(id: number): Promise<{ id: number } | null>;
}
