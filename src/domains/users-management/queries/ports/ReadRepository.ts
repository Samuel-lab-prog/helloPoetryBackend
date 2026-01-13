import type { ClientAuthCredentials } from '../read-models/ClientAuth';
import type { FullUser } from '../read-models/FullUser';
import type { PrivateProfile } from '../read-models/PrivateProfile';
import type { PublicProfile } from '../read-models/PublicProfile';

export interface UserReadRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;

	selectAuthUserByEmail(email: string): Promise<ClientAuthCredentials | null>;

	selectPublicProfile(
		id: number,
		requesterId?: number,
	): Promise<PublicProfile | null>;
	selectPrivateProfile(id: number): Promise<PrivateProfile | null>;
}
