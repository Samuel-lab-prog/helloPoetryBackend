import { join } from 'path';
import { writeFileSafe } from '../../utils/FilesUtils';
import { ensureImportsExists } from '../../utils/EnsureImportsExists.ts';
import {
	ensureInterfaceMethods,
	type Method,
} from '../../utils/EnsureInterfaceMethods.ts';

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
	let content = await ensureImportsExists(
		repositoryPath,
		importPath,
		dataModelsNames,
		true,
	);

	content = ensureInterfaceMethods(repositoryPath, content, repositoryMethods);

	await writeFileSafe(repositoryPath, content);
}
