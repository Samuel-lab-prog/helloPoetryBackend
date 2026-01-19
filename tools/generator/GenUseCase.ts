import { mkdir, readFile, writeFile } from 'fs/promises';
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

await updateDatabaseRepositoryInteface(domain, isCommand, datamodel);

export async function updateDatabaseRepositoryInteface(
	domain: string,
	isCommand: boolean,
	dataModel: string,
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	// Lê o conteúdo do arquivo
	let content: string;
	try {
		content = await readFile(repositoryPath, 'utf-8');
	} catch {
		throw new Error(`Repository file not found: ${repositoryPath}`);
	}

	// Nome do método que será adicionado
	const methodName = isCommand ? `execute${dataModel}` : `select${dataModel}`;

	// Verifica se o método já existe
	if (content.includes(methodName)) {
		console.log(`✔ Method ${methodName} already exists in repository.`);
		return;
	}

	// Regex para localizar o final da interface
	const match = content.match(/export\s+interface\s+\w+\s*{([\s\S]*?)^\}/m);

	if (!match) {
		throw new Error(`Cannot find interface in repository: ${repositoryPath}`);
	}

	const interfaceBody = match[1];

	// Adiciona o novo método (parâmetros genéricos, Promise<any>)
	const newMethod = `  ${methodName}(params: ${dataModel}): Promise<any>;\n`;

	// Substitui o corpo da interface com o novo método
	const updatedContent = content.replace(
		match[0],
		match[0].replace(interfaceBody!, interfaceBody + newMethod),
	);

	// Escreve de volta no arquivo
	await writeFile(repositoryPath, updatedContent, 'utf-8');

	console.log(`✔ Added method ${methodName} to repository: ${repositoryPath}`);
}
