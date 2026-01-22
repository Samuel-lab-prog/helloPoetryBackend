import {
	type FunctionDeclaration,
	type OptionalKind,
	type ParameterDeclarationStructure,
	StructureKind,
} from 'ts-morph';

import { project } from '../helpers/execute';

type EnsureFunctionOptions = {
	isExported?: boolean;
	isAsync?: boolean;
	parameters?: {
		name: string;
		type?: string;
	}[];
	returnType?: string;
};

export function ensureFunction(
	filePath: string,
	functionName: string,
	options: EnsureFunctionOptions = {},
): FunctionDeclaration {
	const sourceFile =
		project.getSourceFile(filePath) ??
		project.createSourceFile(filePath, '', { overwrite: false });

	let fn = sourceFile.getFunction(functionName);

	if (!fn) {
		fn = sourceFile.addFunction({
			name: functionName,
			isExported: options.isExported,
			isAsync: options.isAsync,
		});
	}

	if (options.isExported !== undefined) {
		fn.setIsExported(options.isExported);
	}

	if (options.isAsync !== undefined) {
		fn.setIsAsync(options.isAsync);
	}

	if (options.returnType) {
		fn.setReturnType(options.returnType);
	}

	if (options.parameters) {
		fn.getParameters().forEach((p) => p.remove());

		fn.addParameters(
			options.parameters.map<OptionalKind<ParameterDeclarationStructure>>(
				(p) => ({
					kind: StructureKind.Parameter,
					name: p.name,
					type: p.type,
				}),
			),
		);
	}

	return fn;
}
