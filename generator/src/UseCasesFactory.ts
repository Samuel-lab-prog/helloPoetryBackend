import { existsSync } from 'fs';
import { green } from 'kleur/colors';
import { join } from 'path';

import { generateBoundedContext } from './BoundedContextFactory.ts';
import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

import { ensureTypeAlias } from './utils/ensure-type/execute';
import { ensureDomainErrorClass } from './generators/domain-error/execute.ts';
import { ensureQueriesRepositoryInterface } from './generators/repository-interface/execute.ts';
import { ensureBarrelExport } from './utils/ensures-barrel-line/execute.ts';
import { ensureUseCaseFactoryFile } from './generators/use-case/execute.ts';
import { ensureDtoFile } from './generators/ensure-dto/execute.ts';
import { ensurePolicyFile } from './generators/ensure-policy/execute.ts';
import { project, type Primitive } from './utils/helpers/execute.ts';

type UseCasesConfigFile<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};

async function generate<DM extends DataModelsDefinition>(
	config: UseCasesConfigFile<DM>,
	basePath: string,
): Promise<void> {
	const domainPath = `${basePath}/${config.domain}`;

	await ensureDomainStructure(config.domain, basePath);

	for (const uc of config.useCases) {
		const kind = uc.type === 'command' ? 'commands' : 'queries';
		generateUseCaseFiles(domainPath, uc, kind);
	}

	await project.save();
	console.log(green('Use Cases generated successfully!'));
}

async function ensureDomainStructure(domain: string, basePath: string) {
	const domainPath = `${basePath}/${domain}`;
	if (!existsSync(domainPath)) {
		await generateBoundedContext(domain, basePath);
		console.log(
			green(`Created Bounded Context folder structure for domain: ${domain}`),
		);
	}
}

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
	generateUseCaseBarrel(domainPath, uc.name, kind);
	generateDTOs(domainPath, kind, uc.dtos);
	generatePolicies(domainPath, kind, uc.policies);
}

function generatePolicies(
	domainPath: string,
	kind: 'commands' | 'queries',
	policies?: {
		name: string;
		parameters: Record<string, Primitive>;
		body: string;
	}[],
) {
	if (!policies) return;
	const policiesDir = join(domainPath, 'use-cases', kind, 'policies');
	for (const policy of policies) {
		const policyFilePath = join(policiesDir, 'Policies.ts');
		ensurePolicyFile({
			filePath: policyFilePath,
			name: policy.name,
			parameters: policy.parameters,
			body: policy.body,
		});
	}
}

function generateModels(
	modelsDir: string,
	dataModels?: { name: string; properties: Record<string, string> }[],
) {
	for (const model of dataModels ?? []) {
		const modelFilePath = join(modelsDir, `${model.name}.ts`);
		ensureTypeAlias(modelFilePath, model.name, model.properties, true);

		ensureBarrelExport(join(modelsDir, 'index.ts'), `./${model.name}`);
	}
}

function generateDomainErrors(
	domainPath: string,
	kind: string,
	errors: { name: string; type: string; message: string }[],
) {
	const errorsFilePath = join(domainPath, 'use-cases', kind, 'Errors.ts');
	for (const error of errors) {
		ensureDomainErrorClass(errorsFilePath, error);
	}
}

function syncRepositoryInterface(
	domainPath: string,
	kind: string,
	repositoryMethods: {
		name: string;
		params: { name: string; type: Primitive }[];
		returns: string[];
	}[],
) {
	const repoFilePath = join(
		domainPath,
		'ports',
		`${kind.charAt(0).toUpperCase() + kind.slice(1)}Repository.ts`,
	);
	ensureQueriesRepositoryInterface(
		repoFilePath,
		kind === 'queries' ? 'QueriesRepository' : 'CommandsRepository',
		repositoryMethods,
		`../use-cases/${kind}/models/Index`,
	);
}

function generateUseCaseFactory<DM extends DataModelsDefinition>(
	domainPath: string,
	uc: UseCaseDefinition<DM>,
	kind: 'commands' | 'queries',
) {
	ensureUseCaseFactoryFile({
		domainPath,
		useCaseName: uc.name,
		repositoryName:
			kind === 'queries' ? 'QueriesRepository' : 'CommandsRepository',
		repositoryProperty:
			kind === 'queries' ? 'poemQueriesRepository' : 'poemCommandsRepository',
		params: uc.useCaseFunc.params,
		funcBody: uc.useCaseFunc.body,
		returnType: uc.useCaseFunc.returns.join(' | '),
		modelImports: uc.dataModels.map((m) => ({
			name: m.name,
			from: `./models/${m.name}`,
		})),
		policyImports: [],
		kind,
		domainErrors: uc.errors,
	});
}

function generateUseCaseBarrel(
	domainPath: string,
	name: string,
	kind: 'commands' | 'queries',
) {
	const useCasesBarrelPath = join(domainPath, 'use-cases', kind, 'index.ts');
	ensureBarrelExport(useCasesBarrelPath, `./${name}/execute`);
}

function generateDTOs(
	domainPath: string,
	kind: 'commands' | 'queries',
	dtos?: { inputModel: string; outputModel: string; body: string }[],
) {
	if (!dtos) return;
	const dtosDir = join(domainPath, 'use-cases', kind, 'dtos');
	const dtoFilePath = join(dtosDir, 'Dtos.ts');
	for (const dto of dtos) {
		ensureDtoFile({
			filePath: dtoFilePath,
			functionName: `to${dto.outputModel}`,
			inputModel: dto.inputModel,
			outputModel: dto.outputModel,
			inputPath: `../models/Index`,
			outputPath: `../models/Index`,
			body: dto.body,
		});
	}
}

generate(useCases, './src/domains');
