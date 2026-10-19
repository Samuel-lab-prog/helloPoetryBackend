import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkInvalidDirectionalDependencies } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Directional Dependencies', () => {
	it('ARCHITECTURE-RULE flags use-cases depending on adapters and allows forward dependencies', () => {
		const cruiseResult = makeDepcruiseResult([
			{
				source:
					'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				dependencies: [
					{
						resolved: 'src/domains/poems-management/adapters/PoemRouter.ts',
					},
					{
						resolved: 'src/domains/poems-management/domain/Poem.ts',
					},
				],
			},
		]);

		expect(checkInvalidDirectionalDependencies(cruiseResult)).toEqual([
			{
				from: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				to: 'src/domains/poems-management/adapters/PoemRouter.ts',
				fromLayer: 'use-cases',
				toLayer: 'adapters',
			},
		]);
	});

	it('ARCHITECTURE-RULE allows dependencies that point toward ports and domain', () => {
		const cruiseResult = makeDepcruiseResult([
			{
				source: 'src/domains/users-management/infra/UserRepository.ts',
				dependencies: [
					{ resolved: 'src/domains/users-management/ports/UserRepository.ts' },
					{ resolved: 'src/domains/users-management/domain/User.ts' },
				],
			},
			{
				source:
					'src/domains/poems-management/use-cases/commands/list/execute.ts',
				dependencies: [
					{ resolved: 'src/domains/poems-management/ports/PoemRepository.ts' },
					{ resolved: 'src/domains/poems-management/domain/Poem.ts' },
				],
			},
		]);

		expect(checkInvalidDirectionalDependencies(cruiseResult)).toEqual([]);
	});

	it('ARCHITECTURE-RULE flags use-cases depending on infrastructure', () => {
		const cruiseResult = makeDepcruiseResult([
			{
				source:
					'src/domains/users-management/use-cases/commands/bootstrap-admin/execute.ts',
				dependencies: [
					{
						resolved:
							'src/domains/users-management/infra/queries-repository/selects.ts',
					},
				],
			},
		]);

		expect(checkInvalidDirectionalDependencies(cruiseResult)).toEqual([
			{
				from: 'src/domains/users-management/use-cases/commands/bootstrap-admin/execute.ts',
				to: 'src/domains/users-management/infra/queries-repository/selects.ts',
				fromLayer: 'use-cases',
				toLayer: 'infra',
			},
		]);
	});
});
