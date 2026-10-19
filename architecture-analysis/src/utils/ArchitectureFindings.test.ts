import { describe, expect, it } from 'bun:test';
import {
	evaluateArchitectureFindings,
	getArchitectureFindings,
	recordArchitectureFindings,
	resetArchitectureFindings,
} from './ArchitectureFindings';

describe('ARCHITECTURE-RULE - Architecture findings governance', () => {
	it('permits only the exact documented legacy finding', () => {
		const legacy = {
			ruleId: 'case-mismatch-imports',
			finding: { file: 'src/a.ts', importPath: './helper' },
			reason: 'Existing case mismatch is recorded for a later cleanup.',
		};
		const findings = [{ ...legacy, severity: 'error' as const }];
		const result = evaluateArchitectureFindings(findings, [legacy]);

		expect(result.legacy).toHaveLength(1);
		expect(result.blocking).toEqual([]);
		expect(result.staleLegacy).toEqual([]);
	});

	it('blocks neighboring and newly introduced findings and detects stale entries', () => {
		const legacy = {
			ruleId: 'case-mismatch-imports',
			finding: { file: 'src/a.ts', importPath: './helper' },
			reason: 'Existing case mismatch is recorded for a later cleanup.',
		};
		const newFinding = {
			ruleId: legacy.ruleId,
			severity: 'error' as const,
			finding: { file: 'src/b.ts', importPath: './helper' },
		};
		const result = evaluateArchitectureFindings([newFinding], [legacy]);

		expect(result.blocking).toEqual([newFinding]);
		expect(result.staleLegacy).toEqual([legacy]);
		expect(result.legacy).toEqual([]);
	});

	it('does not let an exception for one rule authorize a different rule', () => {
		const legacy = {
			ruleId: 'case-mismatch-imports',
			finding: { file: 'src/a.ts', importPath: './helper' },
			reason: 'Existing case mismatch is recorded for a later cleanup.',
		};
		const result = evaluateArchitectureFindings(
			[
				{
					ruleId: 'invalid-usecase-error-imports',
					severity: 'error',
					finding: legacy.finding,
				},
			],
			[legacy],
		);

		expect(result.blocking).toHaveLength(1);
		expect(result.staleLegacy).toHaveLength(1);
	});

	it('keeps warning findings non-blocking and tracks analyzer output', () => {
		resetArchitectureFindings();
		recordArchitectureFindings(
			'informational-rule',
			[{ path: 'src/a.ts' }],
			'warning',
		);
		const findings = [...getArchitectureFindings()];

		expect(findings).toEqual([
			{
				ruleId: 'informational-rule',
				severity: 'warning',
				finding: { path: 'src/a.ts' },
			},
		]);
		expect(evaluateArchitectureFindings(findings, []).blocking).toEqual([]);
		resetArchitectureFindings();
	});
});
