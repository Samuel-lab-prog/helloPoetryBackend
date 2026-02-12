/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppError } from '@AppError';
import type { HeadersInit } from 'bun';
import { expect, mock } from 'bun:test';
import { testServer } from '../../index';

type JsonRequestOptions<TBody = unknown> = Omit<
  RequestInit,
  'body' | 'headers'
> & {
  body?: TBody;
  headers?: HeadersInit;
};

/**
 * Create a Request with JSON headers and body.
 * @param url The request URL.
 * @param options Request options, including body and headers.
 * @returns A Request object with JSON headers and body.
 *
 * You can pass any type of body, and it will be stringified to JSON.
 */
export function jsonRequest<TBody = unknown>(
  url: string,
  options: JsonRequestOptions<TBody> = {},
) {
  const { body, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has('Content-Type'))
    finalHeaders.set('Content-Type', 'application/json');

  return new Request(url, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Correctly handles a Response by parsing its JSON and checking the status code.
 * If the response is not OK, it returns an AppError. Otherwise, it returns the parsed JSON as type T.
 * @param response The Response object to handle.
 * @returns A promise that resolves to either the parsed JSON as type T or an AppError.
 */
export async function handleResponse<T>(
  response: Response,
): Promise<T | AppError> {
  const parsed = await response.json();
  if (!response.ok) return parsed as AppError;
  return parsed as T;
}

/**
 * Correctly identifies whether a given result is an AppError by checking for the presence of 'statusCode' and 'message' properties.
 * @param result The result to check.
 * @returns True if the result is an AppError, false otherwise.
 */
export function isAppError(result: unknown): result is AppError {
  return (
    typeof result === 'object' &&
    result !== null &&
    'statusCode' in result &&
    'message' in result &&
    'code' in result
  );
}

/**
 * Expects the result to be an AppError and checks its status code. Uses expect from Bun's test framework.
 * @param result The result to check.
 * @param statusCode The expected status code.
 */
export function expectAppError(result: unknown, statusCode: number) {
  const error = result as AppError;
  expect(error.statusCode).toBe(statusCode);
}

/** * Expects a promise to reject with an error of a specific type. Uses expect from Bun's test framework.
 * @param promise The promise that is expected to reject.
 * @param expectedType The constructor of the expected error type.
 */
export function expectError(
  promise: Promise<unknown>,
  expectedType: new (...args: any[]) => Error,
) {
  return expect(promise).rejects.toBeInstanceOf(expectedType);
}
/**
 * A constant representing a non-existent ID, useful for testing error cases where an ID is expected to not be found in the database.
 * We are not using -1 because the API might have validation that rejects negative IDs before it even checks if they exist, which would prevent us from testing the "not found" logic in the handlers.
 */
export const NON_EXISTENT_ID = 999999999;
/**
 * The app instance used for testing. We create a new Elysia instance and use our server for handling requests in tests.
 */
export const API_INSTANCE = testServer;
/**
 * The API prefix used for making requests to the test server. This should match the prefix defined in the server setup.
 */
export const API_PREFIX = 'http://test/api/v1';

/**
 * A constant representing the maximum time limit for queries in tests, useful for ensuring that tests do not run indefinitely and to catch performance issues.
 */
export const MAX_QUERY_TIME_LIMIT = 300;

type AnyFn = (...args: any[]) => any;

type MockedFn<T extends AnyFn> = ReturnType<typeof mock<T>> & {
  (...args: Parameters<T>): ReturnType<T>;
};

/**
 * A type representing a mocked version of a contract, where each function in the contract is replaced with a mocked function using Bun's mock utility.
 * This allows for easy creation of mocks for testing purposes, while maintaining type safety and autocompletion for the mocked functions.
 * For example, if you have a contract with a function `getUserById(id: number): Promise<User>`, the mocked contract will have a function `getUserById` that is a mocked function, allowing you to specify its behavior in tests.
 *
 * @template T The type of the contract to mock.
 * returns A mocked contract of type T, where each function is replaced with a mocked function.
 */
export type MockedContract<T> = {
  [K in keyof T]: T[K] extends AnyFn ? MockedFn<T[K]> : T[K];
};

/**
 * A utility function to create a mocked contract for testing purposes. It takes a generic type T representing the contract interface and returns an object where each function is replaced with a mocked version using Bun's mock function.
 * This allows us to easily create mocks for external services or repositories when testing our use cases without having to manually mock each function.
 *
 * We also get strict type checking and autocompletion for the mocked contract, since the returned object is typed as MockedContract<T>.
 *
 * @template T The type of the contract to mock.
 * @returns A mocked contract of type T.
 */
export function createMockedContract<
  T extends Record<string, any>,
>(): MockedContract<T> {
  const mocked: Partial<MockedContract<T>> = {};

  for (const key in {} as T) mocked[key as keyof T] = mock<T[keyof T]>() as any;

  return mocked as MockedContract<T>;
}
