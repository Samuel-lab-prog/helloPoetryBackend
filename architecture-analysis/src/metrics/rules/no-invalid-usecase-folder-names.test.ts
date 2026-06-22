import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ClocResult } from '../../Types';
import { checkNoInvalidUseCaseFolderNames } from './no-invalid-usecase-folder-names';

const TEST_ROOT = path.join(
	process.cwd(),
	'src',
	'domains',
	'__tmp-usecase-folder-name-rule__',
);

function makeCloc(file: string): ClocResult {
	return {
		header: {
			cloc_url: '',
			cloc_version: '',
			elapsed_seconds: 0,
			n_files: 1,
			n_lines: 1,
			files_per_second: 0,
			lines_per_second: 0,
			report_file: '',
		},
		SUM: {
			blank: 0,
			comment: 0,
			code: 1,
			nFiles: 1,
		},
		[file]: {
			blank: 0,
			comment: 0,
			code: 1,
			language: 'TypeScript',
		},
	} as ClocResult;
}

beforeEach(() => {
	rmSync(TEST_ROOT, { recursive: true, force: true });
	mkdirSync(TEST_ROOT, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_ROOT, { recursive: true, force: true });
});

describe('checkNoInvalidUseCaseFolderNames', () => {
	it('flags non-kebab-case use-case folders', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-folder-name-rule__',
			'use-cases',
			'commands',
			'CreatePoem',
			'execute.ts',
		);
		const file = path.join(process.cwd(), relativeFile);
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(
			file,
			[
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function CreatePoemFactory(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
		);

		const violations = checkNoInvalidUseCaseFolderNames(makeCloc(relativeFile));

		expect(violations).toHaveLength(1);
		expect(violations[0]?.folder).toBe('CreatePoem');
	});

	it('allows kebab-case use-case folders', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-folder-name-rule__',
			'use-cases',
			'queries',
			'create-poem',
			'execute.ts',
		);
		const file = path.join(process.cwd(), relativeFile);
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(
			file,
			[
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function createPoemFactory(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
		);

		const violations = checkNoInvalidUseCaseFolderNames(makeCloc(relativeFile));

		expect(violations).toHaveLength(0);
	});
});
