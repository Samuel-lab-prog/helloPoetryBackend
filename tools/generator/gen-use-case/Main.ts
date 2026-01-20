import { mkdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { green } from 'kleur/colors';
import { fileURLToPath } from 'url';

import { generateFile } from '../utils/TemplateUtils.ts';
import { toCamelCase, toPascalCase } from '../utils/StringUtils.ts';

import { syncServicesFile } from './colaterals/SyncServicesFunctions.ts';
import { syncDataModels } from './colaterals/SyncDataModels.ts';
import { SyncUseCaseIndex } from './colaterals/SyncUseCaseIndex.ts';
import { SyncRepositoryInterface } from './colaterals/SyncRepositoryInterface.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, 'UseCase.json');
const config: { domain: string; useCases: UseCase[] } = JSON.parse(
	await readFile(configPath, 'utf-8'),
);

function getRepositoryConfig(isCommand: boolean) {
	return {
		type: isCommand ? 'CommandsRepository' : 'QueriesRepository',
		file: isCommand ? 'CommandsRepository' : 'QueriesRepository',
		variable: isCommand ? 'commandsRepository' : 'queriesRepository',
		folder: isCommand ? 'commands' : 'queries',
	};
}

for (const useCase of config.useCases) {
	const {
		name,
		type,
		dataModels,
		errors,
		useCaseFunc,

		repositoryMethods = [],
	} = useCase;

	const isCommand = type === 'command';
	const repo = getRepositoryConfig(isCommand);

	const useCaseName = toCamelCase(useCaseFunc.name);
	const UseCaseName = toPascalCase(useCaseFunc.name);

	const basePath = join(
		'src',
		'domains',
		config.domain,
		'use-cases',
		repo.folder,
		name,
	);

	await mkdir(basePath, { recursive: true });

	const context = {
		UseCaseName,
		useCaseName,
		factoryName: `${useCaseName}Factory`,
		RepositoryType: repo.type,
		RepositoryFile: repo.file,
		repositoryVar: repo.variable,
		UseCaseParams: useCaseFunc.parameters,
		UseCaseReturnType: useCaseFunc.returnTypes.join(' | '),
		DataModels: dataModels,
		Errors: errors,
		RepositoryMethods: repositoryMethods,
		isCommand,
	};

	await generateFile(
		'use-case/execute.ts.tpl',
		join(basePath, 'execute.ts'),
		context,
	);

	await Promise.all([
		SyncRepositoryInterface(
			config.domain,
			isCommand,
			dataModels.flatMap((dm) => dm.name),
			repositoryMethods,
		),
		SyncUseCaseIndex(config.domain, isCommand, name),
		syncServicesFile(
			config.domain,
			isCommand,
			config.useCases.map((uc) => ({
				name: uc.serviceFunc.name,
				parameters: uc.serviceFunc.parameters,
				returnTypes: uc.serviceFunc.returnTypes,
			})),
			dataModels.flatMap((dm) => dm.name),
		),
		syncDataModels(config.domain, isCommand, dataModels),
	]);

	console.log(green(`✔ Use-case ${UseCaseName} generated!`));
}

type UseCase = {
	name: string;
	type: 'command' | 'query';
	dataModels: { name: string; properties: Record<string, string> }[];
	errors: string[];
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
