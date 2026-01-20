import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { join } from 'path';
import { rm } from 'fs/promises';
import { ensureImportsExists } from './execute';
import { writeFileSafe } from '../files-utils/execute';

const TEST_DIR = join(process.cwd(), 'tmp-test');

const FILE_EXISTING = join(TEST_DIR, 'file1.ts');
const FILE_EMPTY = join(TEST_DIR, 'empty.ts');

beforeEach(async () => {
	await writeFileSafe(
		FILE_EXISTING,
		`
import { A, B } from './mod';
import { D as AliasD } from './mod';
import type { T1 } from './types';
import { 
  E,
  F
} from './mod';

const x = 123;
`,
	);

	await writeFileSafe(FILE_EMPTY, `const y = 456;`);
});

afterAll(async () => {
	await rm(TEST_DIR, { recursive: true, force: true });
});

describe('ensureImportsExists', () => {
	it('adds new symbol to existing import without duplicating', async () => {
		const result = await ensureImportsExists(
			FILE_EXISTING,
			'./mod',
			['C', 'A'],
			false,
		);
		await writeFileSafe(FILE_EXISTING, result);

		expect(result).toContain(
			`import { A, B, D as AliasD, E, F, C } from './mod';`,
		);
	});

	it('does not duplicate symbols in type imports', async () => {
		const result = await ensureImportsExists(
			FILE_EXISTING,
			'./types',
			['T1', 'T2'],
			true,
		);
		await writeFileSafe(FILE_EXISTING, result);

		expect(result).toContain(`import type { T1, T2 } from './types';`);
	});

	it('creates new import when none exists', async () => {
		const result = await ensureImportsExists(
			FILE_EMPTY,
			'./newModule',
			['X', 'Y'],
			false,
		);
		await writeFileSafe(FILE_EMPTY, result);

		expect(result).toContain(`import { X, Y } from './newModule';`);
		expect(result).toContain(`const y = 456;`);
	});

	it('handles multiline imports and adds new symbols correctly', async () => {
		const result = await ensureImportsExists(
			FILE_EXISTING,
			'./mod',
			['G'],
			false,
		);
		await writeFileSafe(FILE_EXISTING, result);

		expect(result).toContain(
			`import { A, B, D as AliasD, E, F, G } from './mod';`,
		);
	});

	it('handles symbols with aliases correctly', async () => {
		const result = await ensureImportsExists(
			FILE_EXISTING,
			'./mod',
			['H as AliasH'],
			false,
		);
		await writeFileSafe(FILE_EXISTING, result);

		expect(result).toContain(`H as AliasH`);
	});
});
