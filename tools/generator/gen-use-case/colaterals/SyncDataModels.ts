import { join } from 'path';
import { ensureFileExists } from '../../utils/FilesUtils';
import { ensureExportLine } from '../../utils/ExportUtils';

interface DataModel {
	name: string;
	properties: Record<string, string>;
}

/**
 * Ensures that the TypeScript models exist for a domain, creating them if necessary,
 * and ensures they are exported in the Index.ts file.
 *
 * @param domain Domain name
 * @param isCommand Whether the models are for commands or queries
 * @param dataModels List of models with their properties
 */
export async function syncDataModels(
	domain: string,
	isCommand: boolean,
	dataModels: DataModel[],
): Promise<void> {
	const basePath = getBasePath(domain, isCommand);
	const indexPath = join(basePath, 'Index.ts');

	for (const model of dataModels) {
		const modelPath = join(basePath, `${model.name}.ts`);
		const content = generateModelContent(model);
		const exportLine = generateExportLine(model);

		await ensureFileExists(modelPath, content);
		await ensureExportLine(indexPath, exportLine);
	}
}

/** Returns the base path for models depending on domain and type */
function getBasePath(domain: string, isCommand: boolean): string {
	return join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands/command-models' : 'queries/read-models',
	);
}

/** Generates TypeScript interface content from a DataModel */
function generateModelContent(model: DataModel): string {
	const props = Object.entries(model.properties)
		.map(([key, type]) => `\t${key}: ${type};`)
		.join('\n');

	return `export interface ${model.name} {\n${props}\n}\n`;
}

/** Generates the export line for Index.ts */
function generateExportLine(model: DataModel): string {
	return `export * from './${model.name}';\n`;
}
