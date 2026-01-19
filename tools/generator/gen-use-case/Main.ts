import { mkdir } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';
import { generateFile, toCamelCase, toPascalCase } from '../utils/index.ts';
import { SyncServicesImports } from './colaterals/SyncServicesImports.ts';
import { SyncModels } from './colaterals/SyncModels.ts';
import { SyncUseCaseIndex } from './colaterals/SyncUseCaseIndex.ts';
import { SyncRepositoryInterface } from './colaterals/SyncRepositoryInterface.ts';

const [, , domain, name, type, datamodel] = process.argv;

if (
	!domain ||
	!name ||
	!type ||
	!datamodel ||
	(type !== 'command' && type !== 'query')
) {
	console.error(
		red('Usage: gen-endpoint <domain> <name> <command|query> <DataModel>'),
	);
	process.exit(1);
}

const isCommand = type === 'command';
const useCaseName = toCamelCase(name);
const UseCaseName = toPascalCase(name);

const basePath = join(
	'src',
	'domains',
	domain,
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
	repositoryMethod: isCommand ? `execute${UseCaseName}` : `select${datamodel}`,
	DataModel: datamodel,
	PolicyFile: 'policies',
	isCommand,
};

await generateFile(
	'use-case/execute.ts.tpl',
	join(basePath, 'execute.ts'),
	context,
);
await SyncRepositoryInterface(domain, isCommand, datamodel, UseCaseName);
await SyncUseCaseIndex(domain, isCommand, name);
await SyncServicesImports(domain, isCommand, [useCaseName], [datamodel]);
await SyncModels(domain, isCommand, useCaseName, datamodel);

console.log(green(`✔ Use-case ${UseCaseName} generated with all effects!`));
