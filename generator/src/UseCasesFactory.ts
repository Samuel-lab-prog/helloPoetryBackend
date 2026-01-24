import { join } from 'path';

import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

import { generateModels } from './generators/generate-models/execute.ts';
import { generateDomainErrors } from './generators/domain-error/execute.ts';
import { syncRepositoryInterface } from './generators/repository-interface/execute.ts';
import { generateUseCaseFactory } from './generators/use-case/execute.ts';
import { generateDTOs } from './generators/ensure-dto/execute.ts';
import { generatePolicies } from './generators/ensure-policy/execute.ts';
import { ensureDomainStructure } from './generators/domain-structure/execute.ts';
import { syncRepository } from './generators/respository/execute.ts';
import { syncServices } from './generators/services/execute.ts';
import { project } from './utils/helpers/execute.ts';

type UseCasesConfigFile<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};

function generateUseCaseFiles<DM extends DataModelsDefinition>(
	domainPath: string,
	uc: UseCaseDefinition<DM>,
	kind: 'commands' | 'queries',
) {
	const modelsDir = join(domainPath, 'use-cases', kind, 'models');

	generateModels(modelsDir, uc.dataModels);
	generateDomainErrors(domainPath, kind, uc.errors);
	syncRepositoryInterface(domainPath, kind, uc.repositoryMethods);
	generateUseCaseFactory(domainPath, uc, kind);
	generateDTOs(domainPath, kind, uc.dtos);
	generatePolicies(domainPath, kind, uc.policies);
	syncRepository({
		helpers: [],
		domainPath,
		kind: kind === 'queries' ? 'query' : 'command',
		dataModels: uc.dataModels.map((dm) => ({
			name: dm.name,
			path: '../../use-cases/' + kind + '/models/Index',
		})),
		methods: uc.repositoryMethods,
	});
	syncServices({
		domainPath,
		kind: kind === 'queries' ? 'query' : 'command',
		dataModels: uc.dataModels.map((dm) => ({
			name: dm.name,
			path: '../../../use-cases/' + kind + '/models/Index',
		})),
		services: uc.serviceFunctions,
	});
}

async function generate<DM extends DataModelsDefinition>(
	config: UseCasesConfigFile<DM>,
	basePath: string,
): Promise<void> {
	const { domain, useCases: ucs } = config;
	const domainPath = join(basePath, domain);

	await ensureDomainStructure(domain, basePath);

	for (const uc of ucs) {
		const kind = uc.type === 'command' ? 'commands' : 'queries';
		generateUseCaseFiles(domainPath, uc, kind);
	}

	await project.save();
	console.log('Use Cases generated successfully!');
}

generate(useCases, './src/domains').catch((err) => {
	console.error('Error generating use cases:', err);
	process.exit(1);
});
