import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { CommandResult } from '@SharedKernel/Types';

import type {
	CreatePoem,
	CreatePoemResult,
	UpdatePoem,
	UpdatePoemResult,
	CreatePoemDB,
	UpdatePoemDB,
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

export interface CommandsRepository {
	insertPoem(poem: CreatePoemDB): Promise<CommandResult<CreatePoemResult>>;
	updatePoem(
		poemId: number,
		poem: UpdatePoemDB,
	): Promise<CommandResult<UpdatePoemResult>>;
}
