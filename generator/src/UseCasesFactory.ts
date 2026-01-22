import { existsSync } from 'fs';
import { green } from 'kleur/colors';

import { generateBoundedContext } from './BoundedContextFactory.ts';
import useCases from '../UseCases.config.ts';
import type {
	UseCaseDefinition,
	DataModelsDefinition,
} from './DefineUseCases.ts';

import { ensureTypeAlias } from './utils/ensure-type/execute';
import { ensureProperties } from './utils/ensure-properties/execute';
import { ensureDomainErrorClass } from './generators/domain-error/execute.ts';
import { ensureQueriesRepositoryInterface } from './generators/repository-interface/execute.ts';
import { ensureBarrelExport } from './utils/ensures-barrel-line/execute.ts';
import { project } from './utils/helpers/execute.ts';

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

		// 2️⃣ Generate the domain errors file
		const errorsFilePath = `${domainPath}/use-cases/${kind}/errors.ts`;

		for (const error of uc.errors) {
			ensureDomainErrorClass(errorsFilePath, error);
		}

		// 3️⃣ Sync repository interface
		const repoFilePath = `${domainPath}/ports/${kind.charAt(0).toUpperCase() + kind.slice(1)}Repository.ts`;

		ensureQueriesRepositoryInterface(
			repoFilePath,
			'QueriesRepository',
			uc.repositoryMethods,
			'../use-cases/queries/models/Index',
		);
	}

	await project.save();
}

await generate(useCases, './src/domains');
console.log(green('Use Cases generated successfully!'));
