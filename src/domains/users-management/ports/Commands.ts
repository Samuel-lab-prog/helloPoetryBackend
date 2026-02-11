import type {
	FullUser,
	CreateUserDB,
	UpdateUserData,
	CreateUser,
	UserStatus,
} from '../use-cases/Models';
import type { CommandResult } from '@SharedKernel/Types';

export type CreateUserParams = {
	data: CreateUser;
};

export type UpdateUserParams = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
	data: UpdateUserData;
};

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<FullUser>;
	updateUser: (params: UpdateUserParams) => Promise<FullUser>;
}

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<FullUser>>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<CommandResult<FullUser>>;
	softDeleteUser(id: number): Promise<CommandResult<FullUser>>;
}
