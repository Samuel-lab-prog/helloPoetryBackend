import type { CommandsRepository } from '../../../ports/CommandsRepository';
import type { HashServices } from '../../../ports/HashSerices';
import type { CreateUser } from '../models/Create';
import { UserCreationError, UserCreationConflictError } from '../Errors';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

export function createUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(data: CreateUser): Promise<{ id: number }> {
		const hashedPassword = await hashServices.hash(data.password);
		const result = await commandsRepository.insertUser({
			...data,
			passwordHash: hashedPassword,
		});
		if (!result.ok) {
			if (result.failureReason === 'DUPLICATE_EMAIL') {
				throw new UserCreationConflictError('Email already in use');
			}
			if (result.failureReason === 'DUPLICATE_NICKNAME') {
				throw new UserCreationConflictError('Nickname already in use');
			}
			throw new UserCreationError('Failed to create new user');
		}
		return { id: result.id };
	};
}
