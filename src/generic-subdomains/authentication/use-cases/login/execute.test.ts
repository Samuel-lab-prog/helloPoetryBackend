import { describe, it, expect } from 'bun:test';
import { UnauthorizedError } from '@DomainError';

import { makeAuthScenario } from '../test-helpers/Helper';
import { expectError } from '@TestUtils';

describe.concurrent('USE-CASE - Authentication - LoginClient', () => {
	describe('Successful execution', () => {
		it('should login with valid credentials', async () => {
			const scenario = makeAuthScenario()
				.withAuthUser()
				.withPasswordValid()
				.withTokenGenerated();

			const result = await scenario.executeLogin();
			expect(result).toEqual({
				token: expect.any(String),
				client: {
					id: expect.any(Number),
					role: expect.any(String),
					status: expect.any(String),
				},
			});
		});
		it('should return correct client data', async () => {
			const scenario = makeAuthScenario()
				.withAuthUser({
					id: 10,
					role: 'admin',
					status: 'active',
				})
				.withPasswordValid()
				.withTokenGenerated('my-token');

			const result = await scenario.executeLogin();

			expect(result).toEqual({
				token: 'my-token',
				client: {
					id: 10,
					role: 'admin',
					status: 'active',
				},
			});
		});
	});
	describe('Credentials validation', () => {
		it('should throw UnauthorizedError when client does not exist', async () => {
			const scenario = makeAuthScenario().withAuthUserNotFound();

			await expectError(scenario.executeLogin(), UnauthorizedError);
		});

		it('should throw UnauthorizedError when client is banned', async () => {
			const scenario = makeAuthScenario().withAuthUser({ status: 'banned' });

			await expectError(scenario.executeLogin(), UnauthorizedError);
		});

		it('should throw UnauthorizedError when password is invalid', async () => {
			const scenario = makeAuthScenario()
				.withAuthUser()
				.withPasswordValid(false);

			await expectError(scenario.executeLogin(), UnauthorizedError);
		});

		it('should generate token with correct payload', async () => {
			const scenario = makeAuthScenario()
				.withAuthUser({
					id: 42,
					role: 'author',
					email: 'test@mail.com',
				})
				.withPasswordValid()
				.withTokenGenerated();

			await scenario.executeLogin();

			expect(scenario.mocks.tokenService.generateToken).toHaveBeenCalledWith(
				{
					clientId: 42,
					role: 'author',
					email: 'test@mail.com',
				},
				expect.any(Number),
			);
		});

		it('should not compare password when client does not exist', async () => {
			const scenario = makeAuthScenario().withAuthUserNotFound();

			await expectError(scenario.executeLogin(), UnauthorizedError);

			expect(scenario.mocks.hashService.compare).not.toHaveBeenCalled();
		});

		it('should not generate token when password is invalid', async () => {
			const scenario = makeAuthScenario()
				.withAuthUser()
				.withPasswordValid(false);

			await expectError(scenario.executeLogin(), UnauthorizedError);

			expect(scenario.mocks.tokenService.generateToken).not.toHaveBeenCalled();
		});

		it('should not compare password when client is banned', async () => {
			const scenario = makeAuthScenario().withAuthUser({ status: 'banned' });

			await expectError(scenario.executeLogin(), UnauthorizedError);

			expect(scenario.mocks.hashService.compare).not.toHaveBeenCalled();
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeAuthScenario().withAuthUser();

			scenario.mocks.hashService.compare.mockRejectedValue(new Error('boom'));

			await expectError(scenario.executeLogin(), Error);
		});
	});
});
