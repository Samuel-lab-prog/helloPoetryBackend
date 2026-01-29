import type {
	InsertUser,
	UpdateUserData,
} from '../use-cases/commands/models/index';

export interface CommandsRepository {
	insertUser(user: InsertUser): Promise<{ id: number } | null>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<{ id: number } | null>;
	softDeleteUser(id: number): Promise<{ id: number } | null>;
}
