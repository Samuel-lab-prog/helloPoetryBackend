/* eslint-disable require-await */
import { Elysia } from 'elysia';
import { describe, it, expect, mock } from 'bun:test';
import { createFeedQueriesRouter } from './QueriesRouter';

mock.module('@AuthPlugin', () => {
	return {
		AuthPlugin: new Elysia().decorate('auth', {
			clientId: 7,
			clientRole: 'user',
			clientStatus: 'active',
		}),
	};
});

const poems = [
	{
		id: 1,
		title: 'Poem A',
		authorId: 10,
		content: '...',
		tags: [],
		createdAt: new Date(),
	},
	{
		id: 2,
		title: 'Poem B',
		authorId: 11,
		content: '...',
		tags: [],
		createdAt: new Date(),
	},
];

const getFeed = mock(async () => {
	return poems;
});

const PREFIX = 'http://test/feed';

function createApp() {
	return new Elysia().use(
		createFeedQueriesRouter({
			getFeed,
		}),
	);
}

function jsonRequest(
	url: string,
	options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
) {
	return new Request(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
}

describe('FeedQueriesRouter', () => {
	it('GET /feed -> returns feed and calls service with defaults', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/`, {
				method: 'GET',
			}),
		);

		expect(resp.status).toBe(200);

		const body = await resp.json();

		expect(body).toEqual([
			{
				id: 1,
				title: 'Poem A',
				authorId: 10,
				content: '...',
				tags: [],
				createdAt: poems[0]!.createdAt.toISOString(),
			},
			{
				id: 2,
				title: 'Poem B',
				authorId: 11,
				content: '...',
				tags: [],
				createdAt: poems[1]!.createdAt.toISOString(),
			},
		]);

		expect(getFeed).toHaveBeenCalledTimes(1);
		expect(getFeed).toHaveBeenCalledWith({
			userId: 7,
			page: 1,
			pageSize: 20,
		});
	});

	it('GET /feed?page=2&pageSize=5 -> forwards query params', async () => {
		const app = createApp();

		const resp = await app.handle(
			jsonRequest(`${PREFIX}/?page=2&pageSize=5`, {
				method: 'GET',
			}),
		);
		expect(resp.status).toBe(200);

		expect(getFeed).toHaveBeenCalledWith({
			userId: 7,
			page: 2,
			pageSize: 5,
		});
	});
});
