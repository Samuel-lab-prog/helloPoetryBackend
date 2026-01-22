import { ensureNamedImport } from '../../utils/ensure-import/execute';
import {
	getOrCreateSourceFile,
	project,
	buildParamsType,
	buildReturnType,
	type ParamDefinition,
} from '../../utils/helpers/execute';
import { InterfaceDeclaration } from 'ts-morph';

export function ensureQueriesRepositoryInterface(
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

	const interfaceDeclaration = sourceFile.getInterface(repositoryName);

	if (interfaceDeclaration !== undefined) {
		interfaceDeclaration.remove();
	}

	const newInterface = sourceFile.addInterface({
		name: repositoryName,
		isExported: true,
	});

	for (const m of repositoryMethods) {
		if (newInterface.getMethod(m.name)) {
			continue;
		}

		const paramsType = buildParamsType(m.params);

		const resolvedReturn = buildReturnType(m.returns);
		const returnType = `Promise<${resolvedReturn}>`;

		newInterface.addMethod({
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

	return newInterface;
}
