import { describe, it, expect, beforeEach } from 'bun:test';
import { ensureInterfaceMethods, type Method } from './execute';

let initialContent: string;
let existingInterfaceContent: string;

beforeEach(() => {
	initialContent = `
const helper = () => {};
`;

	existingInterfaceContent = `
export interface QueriesRepository {
  selectUser(params: { id: number }): Promise<User>;
}
const x = 123;
`;
});

describe('ensureInterfaceMethods', () => {
	it('creates QueriesRepository interface if none exists', () => {
		const methods: Method[] = [
			{ name: 'getAllUsers', parameters: [], returnTypes: ['User[]'] },
		];

		const result = ensureInterfaceMethods(
			'QueriesRepository.ts',
			initialContent,
			methods,
		);

		expect(result).toContain('export interface QueriesRepository {');
		expect(result).toContain('getAllUsers(): Promise<User[]>;');
		expect(result).toContain('const helper = () => {};');
	});

	it('creates CommandsRepository interface if file contains "Commands"', () => {
		const methods: Method[] = [
			{
				name: 'executeCommand',
				parameters: [{ name: 'cmd', type: 'string' }],
				returnTypes: ['void'],
			},
		];

		const result = ensureInterfaceMethods(
			'SomeCommands.ts',
			initialContent,
			methods,
		);

		expect(result).toContain('export interface CommandsRepository {');
		expect(result).toContain(
			'executeCommand(params: { cmd: string }): Promise<void>;',
		);
	});

	it('adds new methods to existing interface without duplicating', () => {
		const methods: Method[] = [
			{
				name: 'selectUser',
				parameters: [{ name: 'id', type: 'number' }],
				returnTypes: ['User'],
			},
			{ name: 'selectAllUsers', parameters: [], returnTypes: ['User[]'] },
		];

		const result = ensureInterfaceMethods(
			'QueriesRepository.ts',
			existingInterfaceContent,
			methods,
		);

		expect(result).toContain(
			'selectUser(params: { id: number }): Promise<User>;',
		);
		expect(result).toContain('selectAllUsers(): Promise<User[]>;');
		expect(result).toContain('const x = 123;');
	});

	it('handles methods without parameters correctly', () => {
		const methods: Method[] = [
			{ name: 'fetchStats', parameters: [], returnTypes: ['Stats'] },
		];

		const result = ensureInterfaceMethods(
			'QueriesRepository.ts',
			existingInterfaceContent,
			methods,
		);

		expect(result).toContain('fetchStats(): Promise<Stats>;');
	});

	it('handles methods with multiple parameters', () => {
		const methods: Method[] = [
			{
				name: 'updateUser',
				parameters: [
					{ name: 'id', type: 'number' },
					{ name: 'name', type: 'string' },
				],
				returnTypes: ['User'],
			},
		];

		const result = ensureInterfaceMethods(
			'QueriesRepository.ts',
			existingInterfaceContent,
			methods,
		);

		expect(result).toContain(
			'updateUser(params: { id: number, name: string }): Promise<User>;',
		);
	});

	it('deduplicates methods when called multiple times', () => {
		const methods: Method[] = [
			{ name: 'selectAllUsers', parameters: [], returnTypes: ['User[]'] },
		];

		let result = ensureInterfaceMethods(
			'QueriesRepository.ts',
			existingInterfaceContent,
			methods,
		);
		result = ensureInterfaceMethods('QueriesRepository.ts', result, methods);

		const count = (
			result.match(/selectAllUsers\(\): Promise<User\[\]>;/g) || []
		).length;
		expect(count).toBe(1);
	});
});
