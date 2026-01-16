/* eslint-disable @typescript-eslint/no-explicit-any */
import Elysia from 'elysia';
import { AppError } from '../AppError.ts';
import { DomainError } from '../DomainError.ts';
import { log } from '../logger.ts';
import { SetupPlugin, type SetupPluginContext } from './setupPlugin.ts';

function normalizeError(code: unknown, error: unknown): AppError {
	if (error instanceof AppError) {
		return error;
	}

	if (error instanceof DomainError) {
		return convertDomainError(error);
	}

	const normalizedCode = typeof code === 'string' ? code : 'UNKNOWN';
	return convertElysiaError(normalizedCode, error);
}

function logError(
	context: ReturnType<typeof buildErrorContext>,
	status: number,
	message: string,
) {
	log.error(
		{
			...context,
			response: {
				status,
				message,
			},
		},
		'An error occurred while processing the request',
	);
}

function buildErrorContext(request: Request, ctx: SetupPluginContext) {
	const path = request.url.substring(request.url.indexOf('/', 8));
	const { store, auth } = ctx;

	return {
		request: {
			reqId: store.reqId,
			method: request.method,
			path,
		},
		auth: {
			isAuthenticated: !!auth.clientId,
			userId: auth.clientId,
			role: auth.clientRole,
		},
		timings: {
			totalMs: performance.now() - store.reqInitiatedAt,
			authMs: store.authTiming,
		},
	};
}

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

	logError(context, appError.statusCode, appError.message);

	return sendAppError(appError);
}

function sendAppError(err: AppError) {
	return {
		errorMessages: err.errorMessages,
		statusCode: err.statusCode,
	};
}

function convertElysiaError(code: string, error: unknown): AppError {
	const originalErrorMessage =
		error instanceof Error ? error.message : 'No error message available';
	switch (code) {
		case 'NOT_FOUND':
			return new AppError({
				statusCode: 404,
				errorMessages: ['Not Found: resource not found', originalErrorMessage],
			});
		case 'PARSE':
			return new AppError({
				statusCode: 400,
				errorMessages: [
					'Bad request: Failed to parse request body. Please ensure it is valid JSON and all required fields are present.',
				],
			});
		case 'VALIDATION':
			return new AppError({
				statusCode: 422,
				errorMessages: [
					'Unprocessable entity: validation failed',
					originalErrorMessage,
				],
			});
		case 'INVALID_COOKIE_SIGNATURE':
			return new AppError({
				statusCode: 401,
				errorMessages: [
					'Unauthorized: invalid cookie signature',
					originalErrorMessage,
				],
			});
		case 'INVALID_FILE_TYPE':
			return new AppError({
				statusCode: 400,
				errorMessages: ['Bad request: invalid file type', originalErrorMessage],
			});
		case 'INTERNAL_SERVER_ERROR':
		case 'UNKNOWN':
		default:
			return new AppError({
				statusCode: 500,
				errorMessages: ['Internal server error', originalErrorMessage],
			});
	}
}

function convertDomainError(error: DomainError): AppError {
	const message = error.message;
	const type = error.type;

	switch (type) {
		case 'NOT_FOUND':
			return new AppError({
				errorMessages: [message],
				statusCode: 404,
			});
		case 'INVALID_CREDENTIALS':
			return new AppError({
				errorMessages: [message],
				statusCode: 401,
			});
		case 'VALIDATION_FAILED':
		default:
			return new AppError({
				errorMessages: [message],
				statusCode: 400,
			});
		case 'FORBIDDEN_USER_OPERATION':
			return new AppError({
				errorMessages: [message],
				statusCode: 403,
			});
	}
}

export const ErrorPlugin = new Elysia()
	.use(SetupPlugin)
	.onError({ as: 'scoped' }, (ctx) => handleError(ctx));
