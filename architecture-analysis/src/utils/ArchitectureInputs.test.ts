import { describe, expect, it } from 'bun:test';
import { validateArchitectureInputs } from './ArchitectureInputs';
import type { ClocResult, DepcruiseResult } from '../metrics/Types';

const validDependencies = {
	modules: [{ source: 'src/Index.ts' }],
	summary: {
		totalCruised: 1,
		totalDependenciesCruised: 0,
		error: 0,
		warn: 0,
		info: 0,
		ignore: 0,
		violations: [],
	},
} as unknown as DepcruiseResult;

const validCloc = {
	SUM: { nFiles: 1, code: 10 },
} as ClocResult;

describe('ARCHITECTURE-RULE - Architecture input validation', () => {
	it('accepts complete nonempty source analysis inputs', () => {
		expect(validateArchitectureInputs(validDependencies, validCloc)).toEqual({
			moduleCount: 1,
			sourceFileCount: 1,
			sourceCodeLines: 10,
		});
	});

	it('rejects an empty dependency graph', () => {
		const empty = {
			...validDependencies,
			modules: [],
		} as unknown as DepcruiseResult;
		expect(() => validateArchitectureInputs(empty, validCloc)).toThrow(
			/zero source modules/,
		);
	});

	it('rejects incomplete dependency and source summaries', () => {
		const incomplete = {
			modules: [{ source: 'src/Index.ts' }],
			summary: {
				totalCruised: 0,
				totalDependenciesCruised: 0,
				error: 0,
				warn: 0,
				info: 0,
				ignore: 0,
				violations: [],
			},
		} as unknown as DepcruiseResult;
		expect(() => validateArchitectureInputs(incomplete, validCloc)).toThrow(
			/incomplete analysis summary/,
		);
		expect(() =>
			validateArchitectureInputs(validDependencies, {
				SUM: { nFiles: 0, code: 0 },
			} as ClocResult),
		).toThrow(/empty or incomplete source summary/);
	});

	it('rejects severity counts that disagree with the reported violations', () => {
		const inconsistent = {
			...validDependencies,
			summary: {
				...validDependencies.summary,
				warn: 1,
			},
		} as unknown as DepcruiseResult;
		expect(() => validateArchitectureInputs(inconsistent, validCloc)).toThrow(
			/severity counts do not match/,
		);
	});
});
