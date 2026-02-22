import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { CommandResult } from '@SharedKernel/Types';

import type {
	CreatePoem,
	CreatePoemResult,
	UpdatePoem,
	UpdatePoemResult,
	CreatePoemDB,
	UpdatePoemDB,
	CreateCollection,
} from '../ports/Models';

export type UserMetaData = {
	requesterId: number;
	requesterStatus: UserStatus;
	requesterRole: UserRole;
};

export type CreatePoemParams = {
	data: CreatePoem;
	meta: UserMetaData;
};

export type UpdatePoemParams = {
	data: UpdatePoem;
	poemId: number;
	meta: UserMetaData;
};

export type DeletePoemParams = {
	poemId: number;
	meta: UserMetaData;
};

export interface CommandsRouterServices {
	createPoem: (params: CreatePoemParams) => Promise<CreatePoemResult>;
	updatePoem: (params: UpdatePoemParams) => Promise<UpdatePoemResult>;
	deletePoem: (params: DeletePoemParams) => Promise<void>;

	savePoem: (params: { poemId: number; userId: number }) => Promise<void>;
	removeSavedPoem: (params: {
		poemId: number;
		meta: UserMetaData;
	}) => Promise<void>;

	createCollection: (params: {
		data: CreateCollection;
		meta: UserMetaData;
	}) => Promise<void>;

	addItemToCollection: (params: {
		collectionId: number;
		poemId: number;
		meta: UserMetaData;
	}) => Promise<void>;

	removeItemFromCollection: (params: {
		collectionId: number;
		poemId: number;
		meta: UserMetaData;
	}) => Promise<void>;

	deleteCollection: (params: {
		collectionId: number;
		meta: UserMetaData;
	}) => Promise<void>;
}

export interface CommandsRepository {
	insertPoem(poem: CreatePoemDB): Promise<CommandResult<CreatePoemResult>>;
	updatePoem(
		poemId: number,
		poem: UpdatePoemDB,
	): Promise<CommandResult<UpdatePoemResult>>;
	deletePoem(poemId: number): Promise<CommandResult<void>>;

	savePoem(params: {
		poemId: number;
		userId: number;
	}): Promise<CommandResult<void>>;
	removeSavedPoem(params: {
		poemId: number;
		userId: number;
	}): Promise<CommandResult<void>>;

	createCollection(params: {
		data: CreateCollection;
	}): Promise<CommandResult<void>>;
	addItemToCollection(params: {
		collectionId: number;
		poemId: number;
		userId: number;
	}): Promise<CommandResult<void>>;
	removeItemFromCollection(params: {
		collectionId: number;
		poemId: number;
		userId: number;
	}): Promise<CommandResult<void>>;
	deleteCollection(params: {
		collectionId: number;
		userId: number;
	}): Promise<CommandResult<void>>;
}
