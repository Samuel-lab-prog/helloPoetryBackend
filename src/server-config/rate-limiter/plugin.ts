import Elysia from 'elysia';
import { type RateLimitSettings } from './config';

type RateLimitEntry = {
	count: number;
	expiresAt: number;
};

type RateLimitResult =
	| {
			skipped: true;
	  }
	| {
			skipped: false;
			exceeded: boolean;
			remaining: number;
			resetSeconds: number;
	  };

type HeaderTarget =
	| { set: (name: string, value: string) => void }
	| Record<string, string | number>;

function applyRateLimitHeaders(
	target: HeaderTarget,
	maxLimit: number,
	remaining: number,
	resetSeconds: number,
	withRetryAfter = false,
) {
	const setHeader = (name: string, value: string) => {
		const set = (target as { set?: unknown }).set;
		if (typeof set === 'function') set.call(target, name, value);
		else (target as Record<string, string | number>)[name] = value;
	};

	setHeader('RateLimit-Limit', String(maxLimit));
	setHeader('RateLimit-Remaining', String(remaining));
	setHeader('RateLimit-Reset', String(resetSeconds));

	if (withRetryAfter) setHeader('Retry-After', String(resetSeconds));
}

function cloneRateLimitResponse(
	errorResponse: Response | string,
	maxLimit: number,
	remaining: number,
	resetSeconds: number,
	includeRateLimitHeaders = true,
) {
	if (errorResponse instanceof Response) {
		const response = errorResponse.clone();
		if (includeRateLimitHeaders) {
			applyRateLimitHeaders(
				response.headers,
				maxLimit,
				remaining,
				resetSeconds,
				true,
			);
		}
		return response;
	}

	return errorResponse;
}

function ensureEntry(
	store: Map<string, RateLimitEntry>,
	key: string,
	duration: number,
): RateLimitEntry {
	const now = Date.now();
	const current = store.get(key);
	if (!current || current.expiresAt <= now)
		return { count: 0, expiresAt: now + duration };
	return current;
}

function recordRequest(
	options: RateLimitSettings,
	store: Map<string, RateLimitEntry>,
	request: Request,
	server: Parameters<RateLimitSettings['generator']>[1],
	headers: HeaderTarget,
): RateLimitResult {
	const clientKey = options.generator(request, server);
	if (options.skip(request, clientKey)) return { skipped: true };

	const entry = ensureEntry(store, clientKey, options.duration);
	entry.count += 1;
	store.set(clientKey, entry);
	if (store.size > options.contextSize) {
		const oldestKey = store.keys().next().value as string | undefined;
		if (oldestKey !== undefined) store.delete(oldestKey);
	}

	const remaining = Math.max(options.max - entry.count, 0);
	const resetSeconds = Math.max(
		0,
		Math.ceil((entry.expiresAt - Date.now()) / 1000),
	);
	if (options.headers)
		applyRateLimitHeaders(headers, options.max, remaining, resetSeconds);
	return {
		skipped: false,
		exceeded: entry.count > options.max,
		remaining,
		resetSeconds,
	};
}

function decrementRequest(
	options: RateLimitSettings,
	store: Map<string, RateLimitEntry>,
	request: Request,
	server: Parameters<RateLimitSettings['generator']>[1],
): void {
	const clientKey = options.generator(request, server);
	if (options.skip(request, clientKey)) return;
	const entry = store.get(clientKey);
	if (!entry) return;
	entry.count = Math.max(0, entry.count - 1);
	store.set(clientKey, entry);
}

export function createRateLimitPlugin(options: RateLimitSettings) {
	const store = new Map<string, RateLimitEntry>();
	const countedRequests = new WeakSet<Request>();

	return new Elysia()
		.onBeforeHandle({ as: 'global' }, async (context) => {
			const result = recordRequest(
				options,
				store,
				context.request,
				context.server,
				context.set.headers,
			);
			if (result.skipped) return;

			countedRequests.add(context.request);
			if (!result.exceeded) return;
			context.set.status = 429;
			return cloneRateLimitResponse(
				options.errorResponse,
				options.max,
				result.remaining,
				result.resetSeconds,
				options.headers,
			);
		})
		.onError({ as: 'global' }, async (context) => {
			if (context.code === 'NOT_FOUND' || context.set.status === 404) {
				if (countedRequests.has(context.request)) return;

				const result = recordRequest(
					options,
					store,
					context.request,
					context.server,
					context.set.headers,
				);
				if (result.skipped || !result.exceeded) return;

				context.set.status = 429;
				return cloneRateLimitResponse(
					options.errorResponse,
					options.max,
					result.remaining,
					result.resetSeconds,
					options.headers,
				);
			}

			if (!options.countFailedRequest && countedRequests.has(context.request)) {
				decrementRequest(options, store, context.request, context.server);
			}
		});
}
