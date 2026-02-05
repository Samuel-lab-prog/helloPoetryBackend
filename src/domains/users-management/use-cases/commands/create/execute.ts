import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { HashServices } from '../../../ports/HashSerices';

import { UserCreationError, UserCreationConflictError } from '../../Errors';
import type { FullUser, CreateUser } from '../../Models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

export type CreateUserParams = {
	data: CreateUser;
};

export function createUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(
		params: CreateUserParams,
	): Promise<FullUser> {
		const { data } = params;
		const hashedPassword = await hashServices.hash(data.password);
		const result = await commandsRepository.insertUser({
			...data,
			passwordHash: hashedPassword,
		});
		if (result.ok) return result.data;

		if (result.code !== 'CONFLICT') {
			throw new UserCreationError('Failed to create user');
		}
		if (result.message?.includes('nickname')) {
			throw new UserCreationConflictError('Nickname already in use');
		}
		if (result.message?.includes('email')) {
			throw new UserCreationConflictError('Email already in use');
		}
		throw new UserCreationError(
			'Failed to create user due to unknown conflict',
		);
	};
}
