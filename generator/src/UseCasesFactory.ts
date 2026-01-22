import { existsSync } from 'fs';
import { green } from 'kleur/colors';

import { generateBoundedContext } from './BoundedContextFactory.ts';
import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

import {
	project,
	ensureProperties,
	ensureTypeAlias,
	ensureBarrelExport,
} from './TsMorphUtils.ts';

type UseCasesConfigFile<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};

/**
 * Generates the use case files in the specified domain folder.
 */
async function generate<DM extends DataModelsDefinition>(
	config: UseCasesConfigFile<DM>,
	basePath: string,
): Promise<void> {
	const domainPath = `${basePath}/${config.domain}`;

	if (!existsSync(domainPath)) {
		await generateBoundedContext(config.domain, basePath);
		console.log(
			green(
				`Created Bounded Context folder structure for domain: ${config.domain}`,
			),
		);
	}

	for (const uc of config.useCases) {
		// Info variables
		const kind = uc.type === 'command' ? 'commands' : 'queries';
		const modelsDir = `${domainPath}/use-cases/${kind}/models`;

		// 1️⃣ Generate data models and their barrel export
		for (const model of uc.dataModels ?? []) {
			const { name: modelName, properties } = model;
			const modelFilePath = `${modelsDir}/${modelName}.ts`;

			const modelTypeAlias = ensureTypeAlias(
				modelFilePath,
				modelName,
				'{}',
				true,
			);

			const props = Object.entries(properties).map(([name, type]) => ({
				name,
				type,
			}));

			ensureProperties(modelTypeAlias, props);

			ensureBarrelExport(`${modelsDir}/index.ts`, `./${modelName}`);
		}
	}

	await project.save();
}

await generate(useCases, './src/domains');
console.log(green('Use Cases generated successfully!'));
