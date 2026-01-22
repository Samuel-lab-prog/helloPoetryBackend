import {
	type FunctionDeclaration,
	type OptionalKind,
	type ParameterDeclarationStructure,
	StructureKind,
} from 'ts-morph';

import { project, type Primitive } from '../helpers/execute';

type EnsureFunctionOptions = {
	isExported?: boolean;
	isAsync?: boolean;
	parameters?: {
		name: string;
		type?: string;
	}[];
	returnType?: Primitive | string;
};

/**
 * Ensures that a function declaration exists in a given source file.
 *
 * If the file does not exist in the current ts-morph project, it will be created.
 * If the function does not exist, it will be created.
 * If it already exists, its signature will be synchronized according to the provided options.
 *
 * The function may have its export status, async modifier, return type and parameters
 * created or updated to match the desired definition.
 *
 * @param filePath Absolute or relative path to the source file.
 * @param functionName Name of the function to ensure.
 * @param options Configuration used to define or update the function declaration.
 * @param options.isExported Whether the function should be exported.
 * @param options.isAsync Whether the function should be marked as async.
 * @param options.parameters List of parameters to define. Existing parameters are removed before adding new ones.
 * @param options.returnType Return type of the function.
 *
 * @returns The ensured {@link FunctionDeclaration} instance.
 */
export function ensureFunction(
	filePath: string,
	functionName: string,
	options: EnsureFunctionOptions = {},
): FunctionDeclaration {
	const sourceFile =
		project.getSourceFile(filePath) ??
		project.createSourceFile(filePath, '', { overwrite: false });

	const fn = sourceFile.getFunction(functionName);

	if (fn !== undefined) {
		fn.remove();
	}
	const newFn = sourceFile.addFunction({
		name: functionName,
		isExported: options.isExported,
		isAsync: options.isAsync,
		returnType: options.returnType,
	});

	if (options.parameters) {
		newFn.addParameters(
			options.parameters.map<OptionalKind<ParameterDeclarationStructure>>(
				(p) => ({
					kind: StructureKind.Parameter,
					name: p.name,
					type: p.type,
				}),
			),
		);
	}

	return newFn;
}
