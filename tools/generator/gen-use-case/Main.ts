import { mkdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { green } from 'kleur/colors';
import { generateFile, toCamelCase, toPascalCase } from '../utils/index.ts';
import { SyncServicesImports } from './colaterals/SyncServicesImports.ts';
import { SyncModels } from './colaterals/SyncModels.ts';
import { SyncUseCaseIndex } from './colaterals/SyncUseCaseIndex.ts';
import { SyncRepositoryInterface } from './colaterals/SyncRepositoryInterface.ts';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, 'UseCase.json');

const jsonContent = await readFile(configPath, 'utf-8');
const config = JSON.parse(jsonContent);

for (const useCase of config.useCases) {
	const { name, type, dataModels, errors, useCaseFunc } = useCase;
	const isCommand = type === 'command';
	const useCaseName = toCamelCase(useCaseFunc.name);
	const UseCaseName = toPascalCase(useCaseFunc.name);

	const basePath = join(
		'src',
		'domains',
		config.domain,
		'use-cases',
		isCommand ? 'commands' : 'queries',
		name,
	);
	await mkdir(basePath, { recursive: true });

	const context = {
		UseCaseName,
		useCaseName,
		factoryName: `${useCaseName}Factory`,
		RepositoryType: isCommand ? `CommandsRepository` : `QueriesRepository`,
		RepositoryFile: isCommand ? 'CommandsRepository' : 'QueriesRepository',
		repositoryVar: isCommand ? 'commandsRepository' : 'queriesRepository',
		UseCaseParams: useCaseFunc.parameters,
		UseCaseReturnType: useCaseFunc.returnTypes.join(' | '),
		DataModels: dataModels,
		Errors: errors,
		RepositoryMethods: useCase.repositoryMethods || [],
		isCommand,
	};

	await generateFile(
		'use-case/execute.ts.tpl',
		join(basePath, 'execute.ts'),
		context,
	);
	await SyncRepositoryInterface(
		config.domain,
		isCommand,
		dataModels,
		useCase.repositoryMethods || [],
	);
	await SyncUseCaseIndex(config.domain, isCommand, name);
	await SyncServicesImports(
		config.domain,
		isCommand,
		[useCaseName],
		dataModels,
	);
	await SyncModels(config.domain, isCommand, dataModels);

	console.log(green(`✔ Use-case ${UseCaseName} generated!`));
}
