import { join } from 'path';
import { ensureType, type TypeScriptType } from '../../utils/EnsureType';

export async function syncDataModels(
	domain: string,
	isCommand: boolean,
	dataModels: TypeScriptType[],
) {
	const basePath = getBasePath(domain, isCommand);

	for (const model of dataModels) {
		const modelPath = join(basePath, `${model.name}.ts`);
		await ensureType(modelPath, model);
	}
}

function getBasePath(domain: string, isCommand: boolean): string {
	return join(
		'src',
		'domains',
		domain,
		'use-cases',
		isCommand ? 'commands/commands-models' : 'queries/read-models',
	);
}
