import type { CreatePoem } from './CreatePoem';

export type InsertPoem = CreatePoem & {
	slug: string;
};
