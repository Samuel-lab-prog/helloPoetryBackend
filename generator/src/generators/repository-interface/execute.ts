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

	// garante interface
	const repoInterface =
		sourceFile.getInterface(repositoryName) ??
		sourceFile.addInterface({
			name: repositoryName,
			isExported: true,
		});

	for (const method of repositoryMethods) {
		const methodName = method.name;

		if (repoInterface.getMethod(methodName)) {
			continue;
		}

		// params
		const paramsType = buildParamsType(method.params);

		// return
		const resolvedReturn = buildReturnType(method.returns);
		const returnType = `Promise<${resolvedReturn}>`;

		repoInterface.addMethod({
			name: methodName,
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

		// imports de models
		for (const ret of method.returns) {
			let baseType = ret;
			if (ret === 'null' || ret === 'void') continue;
			if (ret.includes('[]')) {
				baseType = ret.replace('[]', '');
			}
			ensureNamedImport(filePath, baseType, `${modelsImportBasePath}`, true);
		}
	}

	return repoInterface;
}
