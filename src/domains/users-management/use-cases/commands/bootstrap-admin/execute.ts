import type { HashServices } from '@SharedKernel/ports/HashServices';
import type { AdminBootstrapRepository } from '../../../ports/commands';
import type { FullUser } from '../../../ports/models';
import { ConflictError } from '@DomainError';

export type BootstrapAdminParams = {
	email: string;
	password: string;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl?: string | null;
};

type BootstrapAdminResult = {
	user: FullUser;
	created: boolean;
};

interface Dependencies {
	hashServices: HashServices;
	adminBootstrapRepository: AdminBootstrapRepository;
}

export function bootstrapAdminFactory({
	hashServices,
	adminBootstrapRepository,
}: Dependencies) {
	return async function bootstrapAdmin(
		params: BootstrapAdminParams,
	): Promise<BootstrapAdminResult> {
		const { email, password, name, nickname, bio, avatarUrl } = params;
		const passwordHash = await hashServices.hash(password);

		if (await adminBootstrapRepository.findExistingAdmin()) {
			throw new ConflictError('Admin bootstrap already completed');
		}

		const existingByEmail =
			await adminBootstrapRepository.findUserByEmail(email);

		if (existingByEmail && existingByEmail.nickname !== nickname) {
			const nicknameTaken =
				await adminBootstrapRepository.findUserByNickname(nickname);
			if (nicknameTaken) {
				throw new ConflictError('Nickname already in use');
			}
		}

		if (existingByEmail) {
			const updated = await adminBootstrapRepository.updateUserAsAdmin(
				existingByEmail.id,
				{ passwordHash, name, nickname, bio, avatarUrl },
			);

			return { user: updated, created: false };
		}

		const existingByNickname =
			await adminBootstrapRepository.findUserByNickname(nickname);

		if (existingByNickname) {
			throw new ConflictError('Nickname already in use');
		}

		const created = await adminBootstrapRepository.createAdmin({
			email,
			passwordHash,
			name,
			nickname,
			bio,
			avatarUrl,
		});

		return { user: created, created: true };
	};
}
