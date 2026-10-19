import Elysia from 'elysia';
import { describe, expect, it } from 'bun:test';
import type { RateLimitSettings } from './config';
import { createRateLimitPlugin } from './plugin';

function createTestOptions(
	overrides: Partial<RateLimitSettings> = {},
): RateLimitSettings {
	return {
		max: 2,
		duration: 60_000,
		headers: true,
		contextSize: 100,
		countFailedRequest: true,
		generator: (request) => request.headers.get('x-client') ?? 'anonymous',
		errorResponse: new Response(
			JSON.stringify({ code: 'RATE_LIMIT_EXCEEDED' }),
			{ status: 429, headers: { 'Content-Type': 'application/json' } },
		),
		skip: () => false,
		...overrides,
	};
}

function createTestApp(options: RateLimitSettings) {
	return new Elysia()
		.use(createRateLimitPlugin(options))
		.get('/resource', ({ request }) => {
			if (new URL(request.url).searchParams.has('fail'))
				throw new Error('request failed');
			return new Response('ok');
		});
}

function request(
	app: ReturnType<typeof createTestApp>,
	client = 'client-a',
	path = '/resource',
) {
	return app.handle(
		new Request(new URL(path, 'http://localhost').toString(), {
			headers: { 'x-client': client },
		}),
	);
}

describe('UNIT - Rate Limit Plugin', () => {
	it('allows requests within the limit and returns rate limit headers', async () => {
		const app = createTestApp(createTestOptions());

		const first = await request(app);
		const second = await request(app);

		expect(first.status).toBe(200);
		expect(first.headers.get('RateLimit-Limit')).toBe('2');
		expect(first.headers.get('RateLimit-Remaining')).toBe('1');
		expect(second.status).toBe(200);
		expect(second.headers.get('RateLimit-Remaining')).toBe('0');
	});

	it('returns 429 and retry headers after the client exceeds the limit', async () => {
		const app = createTestApp(createTestOptions({ max: 1 }));

		const allowed = await request(app);
		const limited = await request(app);

		expect(allowed.status).toBe(200);
		expect(limited.status).toBe(429);
		expect(limited.headers.get('RateLimit-Limit')).toBe('1');
		expect(limited.headers.get('RateLimit-Remaining')).toBe('0');
		expect(limited.headers.get('RateLimit-Reset')).toBeDefined();
		expect(limited.headers.get('Retry-After')).toBeDefined();
		expect(await limited.json()).toEqual({ code: 'RATE_LIMIT_EXCEEDED' });
	});

	it('counts requests independently by the generated client key', async () => {
		const app = createTestApp(createTestOptions({ max: 1 }));

		expect((await request(app, 'client-a')).status).toBe(200);
		expect((await request(app, 'client-b')).status).toBe(200);
		expect((await request(app, 'client-a')).status).toBe(429);
		expect((await request(app, 'client-b')).status).toBe(429);
	});

	it('allows requests again after the rate limit window expires', async () => {
		const app = createTestApp(createTestOptions({ max: 1, duration: 25 }));

		expect((await request(app)).status).toBe(200);
		expect((await request(app)).status).toBe(429);
		await Bun.sleep(40);
		expect((await request(app)).status).toBe(200);
	});

	it('does not count failed route executions when countFailedRequest is false', async () => {
		const app = createTestApp(
			createTestOptions({ max: 1, countFailedRequest: false }),
		);

		expect((await request(app, 'client-a', '/resource?fail=true')).status).toBe(
			500,
		);
		expect((await request(app)).status).toBe(200);
	});

	it('counts failed route executions when countFailedRequest is true', async () => {
		const app = createTestApp(
			createTestOptions({ max: 1, countFailedRequest: true }),
		);

		expect((await request(app, 'client-a', '/resource?fail=true')).status).toBe(
			500,
		);
		expect((await request(app)).status).toBe(429);
	});
	it('omits rate limit headers when they are disabled', async () => {
		const app = createTestApp(createTestOptions({ headers: false, max: 1 }));

		const allowed = await request(app);
		const limited = await request(app);

		expect(allowed.status).toBe(200);
		expect(limited.status).toBe(429);
		expect(allowed.headers.get('RateLimit-Limit')).toBeNull();
		expect(limited.headers.get('RateLimit-Limit')).toBeNull();
		expect(limited.headers.get('Retry-After')).toBeNull();
	});
});
