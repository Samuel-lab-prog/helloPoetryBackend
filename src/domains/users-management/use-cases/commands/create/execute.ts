import type { UserCommandsRepository } from '../../../ports/CommandsRepository';
import type { HashServices } from '../../../ports/HashSerices';
import type { CreateUser } from '../commands-models/Create';
import { UserCreationError } from '../errors';

interface Dependencies {
	userCommandsRepository: UserCommandsRepository;
	hashServices: HashServices;
}

export function createUserFactory({
	userCommandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(data: CreateUser): Promise<{ id: number }> {
		const hashedPassword = await hashServices.hash(data.password);
		const result = await userCommandsRepository.insertUser({
			...data,
			passwordHash: hashedPassword,
		});
		if (!result) {
			throw new UserCreationError();
		}
		return result;
	};
}
