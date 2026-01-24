import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureInterface } from '../../utils/ensure-interface/execute';
import { ensureProperties } from '../../utils/ensure-properties/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';
import { toPascalCase, toCamelCase } from '../../utils/helpers/execute';
import type {
	DataModelsDefinition,
	UseCaseDefinition,
} from '../../DefineUseCases';
import { ensureBarrelExport } from '../../utils/ensures-barrel-line/execute';

type Param = {
	name: string;
	type: string;
};

type UseCaseFactoryInput = {
	domainPath: string;
	useCaseName: string;
	repositoryName: string;
	repositoryProperty: string;
	params: readonly Param[];
	returnType: string;
	modelImports: readonly { name: string; from: string }[];
	policyImports?: readonly { name: string; from: string }[];
	kind: 'queries' | 'commands';
	domainErrors: {
		name: string;
		type: string;
		message: string;
	}[];
};

function ensureUseCaseFactoryFile({
	domainPath,
	useCaseName,
	repositoryName,
	repositoryProperty,
	params,
	returnType,
	modelImports,
	policyImports = [],
	kind,
	domainErrors,
}: UseCaseFactoryInput) {
	const pascalName = toPascalCase(useCaseName);
	const camelName = toCamelCase(useCaseName);

	const useCaseDir = join(domainPath, 'use-cases', kind, useCaseName);
	const filePath = join(useCaseDir, 'execute.ts');

	if (!existsSync(useCaseDir)) {
		mkdirSync(useCaseDir, { recursive: true });
	}

	ensureNamedImport(
		filePath,
		repositoryName,
		`../../../ports/${repositoryName}`,
		true,
	);

	for (const { name } of modelImports) {
		ensureNamedImport(filePath, name, `../models/Index`, true);
	}

	for (const { name, from } of policyImports) {
		ensureNamedImport(filePath, name, from, true);
	}

	for (const { name } of domainErrors) {
		ensureNamedImport(filePath, name, '../Errors', true);
	}

	const dependencies = ensureInterface(filePath, 'Dependencies', false);
	ensureProperties(dependencies, [
		{ name: repositoryProperty, type: repositoryName },
	]);

	const paramsInterfaceName = `${pascalName}Params`;
	const paramsInterface = ensureInterface(filePath, paramsInterfaceName, true);

	ensureProperties(
		paramsInterface,
		params.map(({ name, type }) => ({ name, type })),
	);

	const factoryName = `${camelName}Factory`;

	const factory = ensureFunction(filePath, factoryName, {
		isExported: true,
		parameters: [
			{
				name: `{ ${repositoryProperty} }`,
				type: 'Dependencies',
			},
		],
	});

	factory.setBodyText(
		`return function ${camelName}(
  params: ${paramsInterfaceName}
): Promise<${returnType}> {
  console.log(params);
  console.log(${repositoryProperty});
  return null;
};`,
	);

	return factory;
}

function generateUseCaseBarrel(
	domainPath: string,
	name: string,
	kind: 'commands' | 'queries',
) {
	const useCasesBarrelPath = join(domainPath, 'use-cases', kind, 'index.ts');
	ensureBarrelExport(useCasesBarrelPath, `./${name}/execute`);
}

export function generateUseCaseFactory<DM extends DataModelsDefinition>(
	domainPath: string,
	uc: UseCaseDefinition<DM>,
	kind: 'commands' | 'queries',
) {
	ensureUseCaseFactoryFile({
		domainPath,
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

	generateUseCaseBarrel(domainPath, uc.name, kind);
}
