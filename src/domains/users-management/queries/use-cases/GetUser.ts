import type { UserReadRepository } from '../ports/ReadRepository';
import type { FullUser } from '../read-models/FullUser';
import { UserNotFoundError } from './errors';

export interface Dependencies {
	userReadRepository: UserReadRepository;
}

export function fetchUserFactory({ userReadRepository }: Dependencies) {
	return async function fetchUser(id: number): Promise<FullUser> {
		const user = await userReadRepository.selectUserById(id);
		if (!user) {
			throw new UserNotFoundError();
		}
		return user;
	};
}
