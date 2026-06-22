import { describe, expect, it, spyOn } from 'bun:test';
import fs from 'node:fs';
import { checkInvalidUseCaseFactories } from './rule';

describe('ARCHITECTURE-RULE-no-invalid-usecase-factories', () => {
	const cloc = {
		header: '',
		SUM: '',
		'src/domains/poems-management/use-cases/commands/create-poem/execute.ts': {
			code: 10,
		},
	} as const;

	function runWithContent(content: string) {
		const readFileSpy = spyOn(fs, 'readFileSync').mockReturnValue(content);
		try {
			return checkInvalidUseCaseFactories(cloc as never);
		} finally {
			readFileSpy.mockRestore();
		}
	}

	it('ARCHITECTURE-RULE accepts a well-formed factory', () => {
		expect(
			runWithContent(
				'export const createPoemFactory = (deps: Dependencies) => deps;',
			),
		).toEqual([]);
	});

	it('ARCHITECTURE-RULE reports default exports, bad names and wrong arity', () => {
		expect(
			runWithContent(
				'export default function createPoem(deps: Dependencies, extra: unknown) { return deps; }',
			),
		).toEqual([
			{
				file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				rule: 'default export',
				details: 'Use-case factories must use named exports.',
			},
			{
				file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				rule: 'factory name',
				details: 'Expected a name ending with Factory, found createPoem.',
			},
			{
				file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				rule: 'parameter count',
				details: 'Expected exactly one dependency parameter, found 2.',
			},
		]);
	});

	it('ARCHITECTURE-RULE reports a wrong dependency type', () => {
		expect(
			runWithContent(
				'export const createPoemFactory = (deps: Dependency) => deps;',
			),
		).toEqual([
			{
				file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				rule: 'dependency type',
				details:
					'Dependency parameter must use a type whose name ends with Dependencies.',
			},
		]);
	});
});
