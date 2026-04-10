import Elysia from 'elysia';
import { initRequestCache } from '../requestCache';

export const RequestCachePlugin = new Elysia().onRequest(() => {
	initRequestCache();
});
