import { join } from 'path';
import { ensureExportLine } from '../../utils/ensure-export-line/execute';

/**
 * Adds export lines to the use-case barrels for the given use case.
 * Creates the file if it does not exist and avoids duplicate lines.
 *
 * @param domain Domain name
 * @param isCommand Whether the use case is a command or query
 * @param useCaseFileName Use case file name
 * @param dataModelNames List of data model names to export
 */
export async function SyncUseCaseBarrels(
	domain: string,
	isCommand: boolean,
	useCaseFileName: string,
	dataModelNames: string[],
) {
	const useCaseDir = join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands' : 'queries',
	);
	const dataModelsDir = join(
		useCaseDir,
		isCommand ? 'commands-models' : 'read-models',
	);

	const useCaseIndexPath = join(useCaseDir, 'Index.ts');
	const dataModelsIndexPath = join(dataModelsDir, 'Index.ts');

	const useCaseExportLine = `export * from './${useCaseFileName}/execute';`;
	const dataModelsExportLines = dataModelNames
		.map((name) => `export * from './${name}';`)
		.join('\n');

	await ensureExportLine(useCaseIndexPath, useCaseExportLine);
	await ensureExportLine(dataModelsIndexPath, dataModelsExportLines);
}
