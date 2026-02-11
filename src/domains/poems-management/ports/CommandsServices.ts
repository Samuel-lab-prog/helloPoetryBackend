import type { UserRole, UserStatus } from '@SharedKernel/Enums';

import type {
	CreatePoem,
	CreatePoemResult,
	UpdatePoem,
	UpdatePoemResult,
} from '../use-cases/Models';

export type CreatePoemParams = {
	data: CreatePoem;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
};

export type UpdatePoemParams = {
	data: UpdatePoem;
	poemId: number;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
};

export interface CommandsRouterServices {
	createPoem: (params: CreatePoemParams) => Promise<CreatePoemResult>;
	updatePoem: (params: UpdatePoemParams) => Promise<UpdatePoemResult>;
}
