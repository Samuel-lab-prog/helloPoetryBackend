import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { join } from 'path';
import { rm } from 'fs/promises';
import { ensureType } from './execute';
import { writeFileSafe, readFileSafe } from '../files-utils/execute';

const TEST_DIR = join(process.cwd(), 'tmp-type-test');
const FILE_EXISTING = join(TEST_DIR, 'file1.ts');
const FILE_EMPTY = join(TEST_DIR, 'empty.ts');
const FILE_NON_EXISTENT = join(TEST_DIR, 'newFile.ts');

beforeEach(async () => {
	await writeFileSafe(
		FILE_EXISTING,
		`
export type User = {
\tid: number;
\tname: string;
};

const x = 123;
`,
	);

	await writeFileSafe(FILE_EMPTY, '');
});

afterAll(async () => {
	await rm(TEST_DIR, { recursive: true, force: true });
});

describe('ensureType', () => {
	it('creates a new type in an empty file', async () => {
		await ensureType(FILE_EMPTY, {
			name: 'Person',
			properties: { firstName: 'string', age: 'number' },
		});

		const content = await readFileSafe(FILE_EMPTY, '');
		expect(content).toContain('export type Person = {');
		expect(content).toContain('\tfirstName: string;');
		expect(content).toContain('\tage: number;');
	});

	it('adds new properties to an existing type', async () => {
		await ensureType(FILE_EXISTING, {
			name: 'User',
			properties: { email: 'string', name: 'string' },
		});

		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toContain('export type User = {');
		expect(content).toContain('\tid: number;');
		expect(content).toContain('\tname: string;'); // didn't duplicate
		expect(content).toContain('\temail: string;');
		expect(content).toContain('const x = 123;'); // keeps original content
	});

	it('deduplicates properties when merging', async () => {
		await ensureType(FILE_EXISTING, {
			name: 'User',
			properties: { id: 'number', name: 'string' }, // already existed
		});

		const content = await readFileSafe(FILE_EXISTING, '');
		const matches = content.match(/id: number;/g) || [];
		expect(matches.length).toBe(1); // ensures only 1 id
	});

	it('adds multiple types in the same file', async () => {
		// adds a new type
		await ensureType(FILE_EXISTING, {
			name: 'Post',
			properties: { title: 'string', content: 'string' },
		});

		const content = await readFileSafe(FILE_EXISTING, '');
		expect(content).toContain('export type User = {');
		expect(content).toContain('export type Post = {');
		expect(content).toContain('\ttitle: string;');
		expect(content).toContain('\tcontent: string;');
	});

	it('handles types in partially filled files', async () => {
		await writeFileSafe(FILE_EMPTY, `// Some comment\nconst foo = 42;`);

		await ensureType(FILE_EMPTY, {
			name: 'Config',
			properties: { debug: 'boolean' },
		});

		const content = await readFileSafe(FILE_EMPTY, '');
		expect(content).toContain('// Some comment');
		expect(content).toContain('const foo = 42;');
		expect(content).toContain('export type Config = {');
		expect(content).toContain('\tdebug: boolean;');
	});

	it('creates a new file if it does not exist', async () => {
		// Before ensureType, the file does not exist
		let content = await readFileSafe(FILE_NON_EXISTENT, '');
		expect(content).toBe(''); // should return initial empty string

		await ensureType(FILE_NON_EXISTENT, {
			name: 'Person',
			properties: { firstName: 'string', age: 'number' },
		});

		content = await readFileSafe(FILE_NON_EXISTENT, '');
		expect(content).toContain('export type Person = {');
		expect(content).toContain('\tfirstName: string;');
		expect(content).toContain('\tage: number;');
	});

	it('creates file with multiple types if it did not exist', async () => {
		await ensureType(FILE_NON_EXISTENT, {
			name: 'Config',
			properties: { debug: 'boolean' },
		});

		await ensureType(FILE_NON_EXISTENT, {
			name: 'Settings',
			properties: { theme: 'string' },
		});

		const content = await readFileSafe(FILE_NON_EXISTENT, '');
		expect(content).toContain('export type Config = {');
		expect(content).toContain('\tdebug: boolean;');
		expect(content).toContain('export type Settings = {');
		expect(content).toContain('\ttheme: string;');
	});

	it('creates file even if directory does not exist', async () => {
		const deepFile = join(TEST_DIR, 'nested', 'deep', 'file.ts');

		await ensureType(deepFile, {
			name: 'DeepType',
			properties: { value: 'number' },
		});

		const content = await readFileSafe(deepFile, '');
		expect(content).toContain('export type DeepType = {');
		expect(content).toContain('\tvalue: number;');
	});
});
