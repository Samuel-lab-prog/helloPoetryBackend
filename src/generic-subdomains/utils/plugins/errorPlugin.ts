/* eslint-disable @typescript-eslint/no-explicit-any */
import Elysia from 'elysia';
import { AppError, type AppErrorCode } from '../AppError.ts';
import { DomainError } from '../DomainError.ts';
import { DatabaseError } from '@DatabaseError';
import { log } from '../logger.ts';
import { SetupPlugin, type SetupPluginContext } from './setupPlugin.ts';

/* ---------------------------------- */
/* Normalization */
/* ---------------------------------- */

function normalizeError(code: unknown, error: unknown): AppError {
	if (error instanceof AppError) return error;
	if (error instanceof DomainError) return convertDomainError(error);
	if (error instanceof DatabaseError) return convertDatabaseError(error);

	const normalizedCode = typeof code === 'string' ? code : 'UNKNOWN';
	return convertElysiaError(normalizedCode);
}

/* ---------------------------------- */
/* Converters */
/* ---------------------------------- */

function convertDatabaseError(error: DatabaseError): AppError {
	switch (error.type) {
		case 'NOT_FOUND':
			return new AppError({
				statusCode: 404,
				message: error.message,
				code: 'NOT_FOUND',
			});

		case 'CONFLICT':
			return new AppError({
				statusCode: 409,
				message: error.message,
				code: 'CONFLICT',
			});

		case 'FORBIDDEN':
			return new AppError({
				statusCode: 403,
				message: error.message,
				code: 'FORBIDDEN',
			});

		default:
			return new AppError({
				statusCode: 500,
				message: error.message,
				code: 'INTERNAL_SERVER_ERROR',
			});
	}
}

function convertElysiaError(code: string): AppError {
	switch (code) {
		case 'NOT_FOUND':
			return new AppError({
				statusCode: 404,
				message: 'Not Found: resource not found',
				code: 'NOT_FOUND',
			});

		case 'PARSE':
			return new AppError({
				statusCode: 400,
				message: 'Bad request: Failed to parse request body.',
				code: 'BAD_REQUEST',
			});

		case 'VALIDATION':
			return new AppError({
				statusCode: 422,
				message: 'Validation failed',
				code: 'VALIDATION',
			});

		case 'INVALID_COOKIE_SIGNATURE':
			return new AppError({
				statusCode: 401,
				message: 'Invalid cookie signature',
				code: 'UNAUTHORIZED',
			});

		default:
			return new AppError({
				statusCode: 500,
				message: 'Internal server error',
				code: 'INTERNAL_SERVER_ERROR',
			});
	}
}

function convertDomainError(error: DomainError): AppError {
	return new AppError({
		message: error.message,
		statusCode: domainStatusMap[error.type] ?? 400,
		code: error.type as AppErrorCode,
	});
}

const domainStatusMap: Record<AppErrorCode, number> = {
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNAUTHORIZED: 401,
	VALIDATION: 400,
	FORBIDDEN: 403,
	BAD_REQUEST: 400,
	GONE: 410,
	INTERNAL_SERVER_ERROR: 500,
	UNKNOWN: 500,
};

/* ---------------------------------- */
/* Logging */
/* ---------------------------------- */

function logError(
	context: ReturnType<typeof buildErrorContext>,
	status: number,
	message: string,
	code: AppErrorCode,
) {
	log.error(
		{
			...context,
			response: {
				status,
				message,
				code,
			},
		},
		'An error occurred while processing the request',
	);
}

/* ---------------------------------- */
/* Context Builder */
/* ---------------------------------- */

function buildErrorContext(request: Request, ctx: SetupPluginContext) {
	const url = new URL(request.url);
	const path = url.pathname;

	const segments = path.split('/').filter(Boolean);

	/**
	 * Example:
	 * /api/v1/friends/accept/263
	 * segments => ['api','v1','friends','accept','263']
	 */
	const targetId = extractNumericSegment(segments);

	return {
		request: {
			reqId: ctx.store.reqId,
			method: request.method,
			path,
			segments,
			targetId,
		},
		auth: {
			isAuthenticated: !!ctx.auth.clientId,
			userId: ctx.auth.clientId,
			role: ctx.auth.clientRole,
		},
		timings: {
			totalMs: performance.now() - ctx.store.reqInitiatedAt,
			authMs: ctx.store.authTiming,
		},
	};
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function extractNumericSegment(segments: string[]): number | undefined {
	const candidate = segments.at(-1);
	if (!candidate) return undefined;

	const parsed = Number(candidate);
	return Number.isInteger(parsed) ? parsed : undefined;
}

/* ---------------------------------- */
/* Handler */
/* ---------------------------------- */

type HandleErrorContext = {
	set: any;
	error: unknown;
	code: unknown;
	request: Request;
	store: SetupPluginContext['store'];
	auth: SetupPluginContext['auth'];
};

function handleError(ctx: HandleErrorContext) {
	const { set, error, code, request, store, auth } = ctx;

	const appError = normalizeError(code, error);
	const context = buildErrorContext(request, { store, auth });

	set.status = appError.statusCode;

	logError(context, appError.statusCode, appError.message, appError.code);

	return sendAppError(appError);
}

function sendAppError(err: AppError) {
	return {
		message: err.message,
		statusCode: err.statusCode,
		code: err.code,
	};
}

/* ---------------------------------- */
/* Plugin */
/* ---------------------------------- */

export const ErrorPlugin = new Elysia()
	.use(SetupPlugin)
	.onError({ as: 'scoped' }, (ctx) => handleError(ctx));
