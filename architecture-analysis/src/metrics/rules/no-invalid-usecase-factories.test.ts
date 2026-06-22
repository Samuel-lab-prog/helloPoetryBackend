import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ClocResult } from '../../Types';
import { checkInvalidUseCaseFactories } from './no-invalid-usecase-factories';

const TEST_ROOT = path.join(
	process.cwd(),
	'src',
	'domains',
	'__tmp-usecase-factory-rule__',
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

describe('checkInvalidUseCaseFactories', () => {
	it('flags default export factories', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-factory-rule__',
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
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export default function publishPoemFactory(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
		);

		const violations = checkInvalidUseCaseFactories(makeCloc(relativeFile));

		expect(violations.some((violation) => violation.rule === 'default export')).toBe(
			true,
		);
	});

	it('flags factories that do not end with Factory', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-factory-rule__',
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
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function publishPoem(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
		);

		const violations = checkInvalidUseCaseFactories(makeCloc(relativeFile));

		expect(violations.some((violation) => violation.rule === 'factory name')).toBe(
			true,
		);
	});

	it('allows current factory signatures', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-factory-rule__',
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
				'export function getFeedFactory({ service }: Dependencies) {',
				'\treturn service;',
				'}',
			].join('\n'),
		);

		const violations = checkInvalidUseCaseFactories(makeCloc(relativeFile));

		expect(violations).toHaveLength(0);
	});
});
