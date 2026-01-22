import { existsSync, mkdirSync } from 'fs';
import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureInterface } from '../../utils/ensure-interface/execute';
import { ensureProperties } from '../../utils/ensure-properties/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';
import { toPascalCase } from '../../utils/helpers/execute';
import { join } from 'path';

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

export function ensureUseCaseFactoryFile(input: UseCaseFactoryInput) {
	const {
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
	} = input;

	const pascalUseCaseName = toPascalCase(useCaseName);
	const camelUseCaseName = useCaseName.replace(/-([a-z])/g, (_, c) =>
		c.toUpperCase(),
	);

	const useCaseDir = join(domainPath, 'use-cases', kind, useCaseName);
	if (!existsSync(useCaseDir)) mkdirSync(useCaseDir, { recursive: true });

	const filePath = join(useCaseDir, 'execute.ts');

	ensureNamedImport(
		filePath,
		repositoryName,
		`../../../ports/${repositoryName}`,
		true,
	);
	for (const imp of modelImports) {
		ensureNamedImport(filePath, imp.name, `../models/${imp.name}`, true);
	}
	for (const imp of policyImports) {
		ensureNamedImport(filePath, imp.name, imp.from, true);
	}
	for (const error of domainErrors) {
		ensureNamedImport(filePath, error.name, `../Errors`, true);
	}

	const dependenciesInterface = ensureInterface(
		filePath,
		'Dependencies',
		false,
	);
	ensureProperties(dependenciesInterface, [
		{ name: repositoryProperty, type: repositoryName },
	]);

	const paramsInterfaceName = `${pascalUseCaseName}Params`;
	const paramsInterface = ensureInterface(filePath, paramsInterfaceName, true);
	ensureProperties(
		paramsInterface,
		params.map((p) => ({ name: p.name, type: p.type })),
	);

	const factoryName = `${pascalUseCaseName}Factory`;
	const factoryFn = ensureFunction(filePath, factoryName, {
		isExported: true,
		parameters: [{ name: `{ ${repositoryProperty} }`, type: 'Dependencies' }],
	});

	factoryFn.setBodyText(
		`return async function ${camelUseCaseName}(
  params: ${paramsInterfaceName}
): Promise<${returnType}> {
  console.log(params);
  console.log(${repositoryProperty});
  return null as unknown as ${returnType};
};`,
	);

	return factoryFn;
}
