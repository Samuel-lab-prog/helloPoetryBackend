import { join } from 'path';
import {
	ensureExportedTypeAlias,
	type TypeScriptType,
} from '../../../utils/ensure-types-exists/execute';

export async function syncDataModels(
	domain: string,
	isCommand: boolean,
	dataModels: TypeScriptType[],
	basePath = 'src/domains',
) {
	const path = getBasePath(domain, isCommand, basePath);

	for (const model of dataModels) {
		const modelPath = join(path, `${model.name}.ts`);
		await ensureExportedTypeAlias(modelPath, model);
	}
}

function getBasePath(
	domain: string,
	isCommand: boolean,
	basePath = 'src/domains',
) {
	return join(
		basePath,
		domain,
		'use-cases',
		isCommand ? 'commands/commands-models' : 'queries/read-models',
	);
}
