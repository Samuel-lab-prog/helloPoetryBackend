import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureImportsExists } from '../../utils/EnsureImportsExists.ts';

interface RepositoryMethod {
	name: string;
	parameters: string[];
	returnTypes: string[];
}

export async function SyncRepositoryInterface(
	domain: string,
	isCommand: boolean,
	dataModelsNames: string[],
	repositoryMethods: RepositoryMethod[],
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	// Garantir imports corretos
	const importPath = `../use-cases/${isCommand ? 'commands' : 'queries'}/read-models/Index`;
	const content = await ensureImportsExists(
		repositoryPath,
		importPath,
		dataModelsNames,
		true,
	);

	const updatedContent = addMethodsToInterface(content, repositoryMethods);

	await writeFile(repositoryPath, updatedContent, 'utf-8');
}

/**
 * Adds methods to the repository interface.
 * Removes duplicates and keeps formatting clean.
 */
function addMethodsToInterface(
	content: string,
	repositoryMethods: RepositoryMethod[],
): string {
	// Locate the interface
	const match = content.match(/export\s+interface\s+\w+\s*{([\s\S]*?)^\}/m);
	if (!match) throw new Error('Cannot find interface in repository');

	const interfaceBody = match[1];

	// Generate new methods (only those that don't exist)
	const newMethods = repositoryMethods
		.filter((m) => !methodExists(interfaceBody!, m.name))
		.map((m) => formatMethod(m))
		.join('');

	if (!newMethods) return content; // nothing to add

	// Update the interface content
	const trimmedBody = interfaceBody!.trimEnd();
	const updatedInterface = trimmedBody + '\n' + newMethods;

	return content.replace(
		match[0],
		match[0].replace(interfaceBody!, updatedInterface),
	);
}

/**
 * Checks if a method already exists in the interface
 */
function methodExists(interfaceBody: string, methodName: string): boolean {
	const regex = new RegExp(`\\b${methodName}\\s*\\(`, 'm');
	return regex.test(interfaceBody);
}

/**
 * Formats a method for insertion into the interface
 */
function formatMethod(method: RepositoryMethod): string {
	const params = method.parameters
		.map((p) => `${p.split(':')[0]}: ${p.split(':')[1]?.trim() || 'any'}`)
		.join(', ');

	const returnType = method.returnTypes.join(' | ');

	return `  ${method.name}(params: { ${params} }): Promise<${returnType}>;\n`;
}
