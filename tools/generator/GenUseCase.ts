import { mkdir } from 'fs/promises';
import { join } from 'path';
import { green, red } from 'kleur/colors';
import { generateFile, toCamelCase, toPascalCase } from './utils/index.ts';

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

console.log(green(`✔ Creating use-case at ${basePath}`));

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
