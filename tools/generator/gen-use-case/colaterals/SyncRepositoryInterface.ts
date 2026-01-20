import { join } from 'path';
import { writeFileSafe } from '../../utils/files-utils/execute.ts';
import { ensureNamedImportDeclaration } from '../../utils/ensure-imports-exists/execute.ts';
import {
	ensureRepositoryInterfaceMethods,
	type Method,
} from '../../utils/ensure-interface-methods/execute.ts';

/**
 * Synchronizes a repository interface:
 * - Ensures the interface file exists.
 * - Adds missing imports.
 * - Adds missing repository methods, deduplicating existing ones.
 *
 * @param domain Domain name
 * @param isCommand Whether this is a commands or queries repository
 * @param dataModelsNames List of data models to import
 * @param repositoryMethods List of methods to add to the interface
 */
export async function syncRepositoryInterface(
	domain: string,
	isCommand: boolean,
	dataModelsNames: string[],
	repositoryMethods: Method[],
) {
	const repositoryPath = join(
		'src',
		'domains',
		domain,
		'ports',
		isCommand ? 'CommandsRepository.ts' : 'QueriesRepository.ts',
	);

	const importPath = `../use-cases/${isCommand ? 'commands/commands-models' : 'queries/read-models'}/Index`;
	let content = await ensureNamedImportDeclaration(
		repositoryPath,
		importPath,
		dataModelsNames,
		true,
	);

	content = await ensureRepositoryInterfaceMethods(repositoryPath, isCommand ? 'CommandsRepository' : 'QueriesRepository', repositoryMethods);

	await writeFileSafe(repositoryPath, content);
}
