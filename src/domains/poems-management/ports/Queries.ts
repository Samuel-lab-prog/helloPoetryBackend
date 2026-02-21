import type { MyPoem, AuthorPoem, PoemPreviewPage, SavedPoem } from './Models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export type RequesterContext = {
	requesterId?: number;
	requesterRole?: UserRole;
	requesterStatus?: UserStatus;
};

export type NavigationOptions = {
	limit?: number;
	cursor?: number;
};

export type PoemSortOptions = {
	orderBy?: 'createdAt' | 'title';
	orderDirection?: 'asc' | 'desc';
};

export type PoemFilterOptions = {
	searchTitle?: string;
	tags?: string[];
};

export type GetAuthorPoemsParams = RequesterContext & {
	authorId: number;
};

export type GetMyPoemsParams = {
	requesterId: number;
};

export type GetPoemParams = RequesterContext & {
	poemId: number;
};

export type SearchPoemsParams = RequesterContext & {
	navigationOptions: NavigationOptions;
	filterOptions?: PoemFilterOptions;
	sortOptions?: PoemSortOptions;
};

export interface QueriesRouterServices {
	getMyPoems(params: GetMyPoemsParams): Promise<MyPoem[]>;
	getAuthorPoems(params: GetAuthorPoemsParams): Promise<AuthorPoem[]>;
	getPoemById(params: GetPoemParams): Promise<AuthorPoem>;
	searchPoems(params: SearchPoemsParams): Promise<PoemPreviewPage>;
	getSavedPoems(params: { requesterId: number }): Promise<SavedPoem[]>;
}

export interface QueriesRepository {
	selectMyPoems(requesterId: number): Promise<MyPoem[]>;
	selectAuthorPoems(authorId: number): Promise<AuthorPoem[]>;
	selectPoemById(poemId: number): Promise<AuthorPoem | null>;

	selectPoems(params: {
		navigationOptions: NavigationOptions;
		sortOptions: PoemSortOptions;
		filterOptions: PoemFilterOptions;
	}): Promise<PoemPreviewPage>;

	selectSavedPoems(requesterId: number): Promise<SavedPoem[]>;
	selectSavedPoem(params: {
		poemId: number;
		userId: number;
	}): Promise<SavedPoem | null>;
}
