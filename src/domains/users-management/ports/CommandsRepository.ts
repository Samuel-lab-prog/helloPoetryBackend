import type {
	InsertUser,
	UpdateUserData,
} from '../use-cases/commands/models/Index';

export type FailureReasons =
	| 'DB_ERROR'
	| 'DUPLICATE_EMAIL'
	| 'DUPLICATE_NICKNAME'
	| 'NOT_FOUND'
	| 'FOREIGN_KEY_VIOLATION';

export type CommandResult = {
	ok: boolean;
	failureReason?: FailureReasons;
};

export interface CommandsRepository {
	insertUser(
		user: InsertUser,
	): Promise<
		| { id: number; ok: true }
		| { ok: false; failureReason: CommandResult['failureReason'] }
	>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<
		| { id: number; ok: true }
		| { ok: false; failureReason: CommandResult['failureReason'] }
	>;
	softDeleteUser(
		id: number,
	): Promise<
		| { id: number; ok: true }
		| { ok: false; failureReason: CommandResult['failureReason'] }
	>;
}
