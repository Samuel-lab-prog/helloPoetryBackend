import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ClocResult } from '../../Types';
import { checkInvalidUseCaseErrorImports } from './no-invalid-usecase-error-imports';

const TEST_ROOT = path.join(
	process.cwd(),
	'src',
	'domains',
	'__tmp-usecase-error-import-rule__',
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

describe('checkInvalidUseCaseErrorImports', () => {
	it('flags direct imports from the internal domain error module', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-error-import-rule__',
			'use-cases',
			'commands',
			'publish-poem',
			'execute.ts',
		);
		const file = path.join(process.cwd(), relativeFile);
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(
			file,
			[
				"import { ForbiddenError } from '@GenericSubdomains/utils/domainError';",
				'',
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function publishPoemFactory(deps: Dependencies) {',
				'\tthrow new ForbiddenError();',
				'}',
			].join('\n'),
		);

		const violations = checkInvalidUseCaseErrorImports(makeCloc(relativeFile));

		expect(violations).toHaveLength(1);
		expect(violations[0]?.errorName).toBe('ForbiddenError');
	});

	it('allows the canonical domain error alias', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-error-import-rule__',
			'use-cases',
			'queries',
			'get-feed',
			'execute.ts',
		);
		const file = path.join(process.cwd(), relativeFile);
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(
			file,
			[
				"import { ForbiddenError } from '@DomainError';",
				'',
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function getFeedFactory(deps: Dependencies) {',
				'\tthrow new ForbiddenError();',
				'}',
			].join('\n'),
		);

		const violations = checkInvalidUseCaseErrorImports(makeCloc(relativeFile));

		expect(violations).toHaveLength(0);
	});
});
