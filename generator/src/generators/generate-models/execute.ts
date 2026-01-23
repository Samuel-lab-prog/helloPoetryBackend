import { join } from 'path';
import { ensureTypeAlias } from '../../utils/ensure-type/execute';
import { ensureBarrelExport } from '../../utils/ensures-barrel-line/execute';

export function generateModels(
	modelsDir: string,
	dataModels?: { name: string; properties: Record<string, string> }[],
) {
	for (const model of dataModels ?? []) {
		const modelFilePath = join(modelsDir, `${model.name}.ts`);
		ensureTypeAlias(modelFilePath, model.name, model.properties, true);

		ensureBarrelExport(join(modelsDir, 'Index.ts'), `./${model.name}`);
	}
}
