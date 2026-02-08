import { feedPoemSchema } from '../ports/schemas/FeedPoemsSchema';

export type FeedItem = (typeof feedPoemSchema)['static'];
