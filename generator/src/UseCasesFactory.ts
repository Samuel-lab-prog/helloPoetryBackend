import { existsSync } from 'fs';
import { green } from 'kleur/colors';
import { join } from 'path';

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
import { ensureUseCaseFactoryFile } from './generators/use-case/execute.ts';
import { project } from './utils/helpers/execute.ts';

type UseCasesConfigFile<DM extends DataModelsDefinition> = {
	domain: string;
	useCases: UseCaseDefinition<DM>[];
};

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
		const kind = uc.type === 'command' ? 'commands' : 'queries';
		const modelsDir = join(domainPath, 'use-cases', kind, 'models');

		// 1️⃣ Generate data models + barrel export
		for (const model of uc.dataModels ?? []) {
			const { name: modelName, properties } = model;
			const modelFilePath = join(modelsDir, `${modelName}.ts`);

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
			ensureBarrelExport(join(modelsDir, 'index.ts'), `./${modelName}`);
		}

		// 2️⃣ Generate domain errors
		const errorsFilePath = join(domainPath, 'use-cases', kind, 'Errors.ts');
		for (const error of uc.errors) {
			ensureDomainErrorClass(errorsFilePath, error);
		}

		// 3️⃣ Sync repository interface
		const repoFilePath = join(
			domainPath,
			'ports',
			`${kind.charAt(0).toUpperCase() + kind.slice(1)}Repository.ts`,
		);
		ensureQueriesRepositoryInterface(
			repoFilePath,
			kind === 'queries' ? 'QueriesRepository' : 'CommandsRepository',
			uc.repositoryMethods,
			`../use-cases/${kind}/models/Index`,
		);

		// 4️⃣ Generate use-case factory inside a folder + execute.ts
		ensureUseCaseFactoryFile({
			domainPath: domainPath,
			useCaseName: uc.name,
			repositoryName:
				kind === 'queries' ? 'QueriesRepository' : 'CommandsRepository',
			repositoryProperty:
				kind === 'queries' ? 'poemQueriesRepository' : 'poemCommandsRepository',
			params: uc.useCaseFunc.params,
			returnType: uc.useCaseFunc.returns.join(' | '),
			modelImports: uc.dataModels.map((m) => ({
				name: m.name,
				from: `./models/${m.name}`,
			})),
			policyImports: [],
			kind,
			domainErrors: uc.errors,
		});
		// 5️⃣ Ensure barrel export for use-cases
		const useCasesBarrelPath = join(domainPath, 'use-cases', kind, 'index.ts');
		ensureBarrelExport(useCasesBarrelPath, `./${uc.name}/execute`);
	}

	await project.save();
	console.log(green('Use Cases generated successfully!'));
}

await generate(useCases, './src/domains');
