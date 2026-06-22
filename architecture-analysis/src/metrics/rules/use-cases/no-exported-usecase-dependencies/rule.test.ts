import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ClocResult } from '../../../../Types';
import { checkExportedUseCaseDependencies } from './rule';

const TEST_ROOT = path.join(
	process.cwd(),
	'src',
	'domains',
	'__tmp-usecase-deps-rule__',
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

describe('ARCHITECTURE-RULE-no-exported-usecase-dependencies', () => {
	it('ARCHITECTURE-RULE flags exported Dependencies interfaces', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-deps-rule__',
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
				'export interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function publishPoemFactory(deps: Dependencies) {',
				'\treturn async function publishPoem() {',
				'\t\treturn deps.service;',
				'\t};',
				'}',
			].join('\n'),
		);

		const violations = checkExportedUseCaseDependencies(makeCloc(relativeFile));

		expect(violations).toHaveLength(1);
		expect(violations[0]?.declaration).toBe('export interface Dependencies');
	});

	it('ARCHITECTURE-RULE allows local Dependencies types', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-deps-rule__',
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
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function getFeedFactory(deps: Dependencies) {',
				'\treturn async function getFeed() {',
				'\t\treturn deps.service;',
				'\t};',
				'}',
			].join('\n'),
		);

		const violations = checkExportedUseCaseDependencies(makeCloc(relativeFile));

		expect(violations).toHaveLength(0);
	});
});
