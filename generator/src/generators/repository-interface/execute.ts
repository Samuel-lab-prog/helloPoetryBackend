import { ensureNamedImport } from '../../utils/ensure-import/execute';
import {
	getOrCreateSourceFile,
	project,
	buildParamsType,
	buildReturnType,
	type ParamDefinition,
	type Primitive,
} from '../../utils/helpers/execute';
import { InterfaceDeclaration } from 'ts-morph';
import { join } from 'path';

function ensureQueriesRepositoryInterface(
	filePath: string,
	repositoryName: string,
	repositoryMethods: readonly {
		name: string;
		params: ParamDefinition[];
		returns: readonly string[];
	}[],
	modelsImportBasePath: string,
): InterfaceDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	let interfaceDeclaration = sourceFile.getInterface(repositoryName);
	if (!interfaceDeclaration) {
		interfaceDeclaration = sourceFile.addInterface({
			name: repositoryName,
			isExported: true,
		});
	}

	for (const m of repositoryMethods) {
		if (interfaceDeclaration.getMethod(m.name)) {
			continue;
		}

		const paramsType = buildParamsType(m.params);

		const resolvedReturn = buildReturnType(m.returns);
		const returnType = `Promise<${resolvedReturn}>`;

		interfaceDeclaration!.addMethod({
			name: m.name,
			parameters:
				paramsType === 'void'
					? []
					: [
							{
								name: 'params',
								type: paramsType,
							},
						],
			returnType,
		});

		for (const ret of m.returns) {
			let baseType = ret;
			if (ret === 'null' || ret === 'void') continue;
			if (ret.includes('[]')) {
				baseType = ret.replace('[]', '');
			}
			ensureNamedImport(filePath, baseType, `${modelsImportBasePath}`, true);
		}
	}

	return interfaceDeclaration!;
}

export function syncRepositoryInterface(
	domainPath: string,
	kind: string,
	repositoryMethods: {
		name: string;
		params: { name: string; type: Primitive }[];
		returns: string[];
	}[],
) {
	const repoFilePath = join(
		domainPath,
		'ports',
		`${kind.charAt(0).toUpperCase() + kind.slice(1)}Repository.ts`,
	);
	ensureQueriesRepositoryInterface(
		repoFilePath,
		kind === 'queries' ? 'QueriesRepository' : 'CommandsRepository',
		repositoryMethods,
		`../use-cases/${kind}/models/Index`,
	);
}
