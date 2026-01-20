import { mkdir } from 'fs/promises';
import { join } from 'path';
import { green } from 'kleur/colors';

import { generateFile } from '../utils/TemplateUtils.ts';
import { toCamelCase, toPascalCase } from '../utils/string-utils/execute.ts';
import { readFileSafe } from '../utils/files-utils/execute.ts';

import { syncDataModels } from './colaterals/sync-data-models/execute.ts';
import { SyncUseCaseBarrels } from './colaterals/SyncUseCaseBarrels.ts';
import { syncRepositoryInterface } from './colaterals/SyncRepositoryInterface.ts';
import { syncDomainErrors } from './colaterals/sync-domain-errors/execute.ts';

const configPath = join(__dirname, 'UseCase.json');
const config: { domain: string; useCases: UseCase[] } = JSON.parse(
	await readFileSafe(configPath),
);

function getRepositoryConfig(isCommand: boolean) {
	return {
		type: isCommand ? 'CommandsRepository' : 'QueriesRepository',
		file: isCommand ? 'CommandsRepository' : 'QueriesRepository',
		variable: isCommand ? 'commandsRepository' : 'queriesRepository',
		folder: isCommand ? 'commands' : 'queries',
	};
}

for (const uc of config.useCases) {
	const isCommand = uc.type === 'command';
	const repo = getRepositoryConfig(isCommand);

	const basePath = join(
		'src',
		'domains',
		config.domain,
		'use-cases',
		repo.folder,
		uc.name,
	);

	await mkdir(basePath, { recursive: true });

	const context = {
		RepositoryInterfaceType: repo.type,
		RepositoryInterfaceFileName: repo.file,
		RepositoryVariable: repo.variable,
		RepositoryMethods: uc.repositoryMethods,
		DataModelsFolder: isCommand ? 'commands-models' : 'read-models',
		DataModels: uc.dataModels,
		DomainErrors: uc.errors,

		UseCaseInterfaceName: `${toPascalCase(uc.useCaseFunc.name)}Params`,
		UseCaseFunctionName: toCamelCase(uc.useCaseFunc.name),
		UseCaseFactoryName: `${toCamelCase(uc.useCaseFunc.name)}Factory`,
		UseCaseFunctionReturnTypes: uc.useCaseFunc.returnTypes.join(' | '),
		UseCaseFunctionParameters: uc.useCaseFunc.parameters,
	};

	await generateFile(
		'use-case/execute.ts.tpl',
		join(basePath, 'execute.ts'),
		context,
	);

	await Promise.all([
		SyncUseCaseBarrels(
			config.domain,
			isCommand,
			uc.name,
			uc.dataModels.map((dm) => dm.name),
		),
		syncDataModels(config.domain, isCommand, uc.dataModels),
		syncRepositoryInterface(
			config.domain,
			isCommand,
			uc.dataModels.map((dm) => dm.name),
			uc.repositoryMethods,
		),
		syncDomainErrors(config.domain, isCommand, uc.errors),
	]);

	console.log(green(`✔ Use-case ${uc.name} generated!`));
}

type UseCase = {
	name: string;
	type: 'command' | 'query';
	dataModels: { name: string; properties: Record<string, string> }[];
	errors: {
		name: string;
		type: string;
		message: string;
	}[];
	repositoryMethods: {
		name: string;
		parameters: { name: string; type: string }[];
		returnTypes: string[];
	}[];
	useCaseFunc: {
		name: string;
		parameters: { name: string; type: string }[];
		returnTypes: string[];
	};
	serviceFunc: {
		name: string;
		parameters: { name: string; type: string }[];
		returnTypes: string[];
	};
	http: {
		method: string;
		path: string;
		query: { name: string; type: string }[];
		params: { name: string; type: string }[];
		responsesCodes: string[];
		needsAuth: boolean;
		schemaName: string;
		summary: string;
		description: string;
		tags: string[];
	};
};
