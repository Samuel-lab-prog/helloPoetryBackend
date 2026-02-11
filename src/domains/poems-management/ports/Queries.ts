import type { MyPoem, AuthorPoem } from '../use-cases/Models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export type GetAuthorPoemsParams = {
	authorId: number;
	requesterId?: number;
	requesterRole?: UserRole;
	requesterStatus?: UserStatus;
};

export type GetMyPoemsParams = {
	requesterId: number;
};

export type GetPoemParams = {
	requesterId?: number;
	requesterRole?: UserRole;
	requesterStatus?: UserStatus;
	poemId: number;
};

export interface QueriesRouterServices {
	getMyPoems: (params: GetMyPoemsParams) => Promise<MyPoem[]>;
	getAuthorPoems: (params: GetAuthorPoemsParams) => Promise<AuthorPoem[]>;
	getPoemById: (params: GetPoemParams) => Promise<AuthorPoem>;
}

export interface QueriesRepository {
	selectMyPoems(requesterId: number): Promise<MyPoem[]>;
	selectAuthorPoems(authorId: number): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<AuthorPoem | null>;
}
