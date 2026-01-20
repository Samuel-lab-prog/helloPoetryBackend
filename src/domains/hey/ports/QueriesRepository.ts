import type {
	FullUser,
	PartialUser,
} from '../use-cases/queries/read-models/Index';

export interface QueriesRepository {
	selectFullUser(params: { userId: number }): Promise<FullUser[]>;
	selectPartialUser(params: { userId: number }): Promise<PartialUser[]>;
}
