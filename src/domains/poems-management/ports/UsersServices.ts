import type { UserRole, UserStatus } from '@SharedKernel/Enums';

type UserBasicInfo = {
	exists: boolean;
	id: number | null;
	status: UserStatus | null;
	role: UserRole | null;
};

export interface UsersServicesForPoems {
	getUserBasicInfo(userId: number): Promise<UserBasicInfo>;
}
