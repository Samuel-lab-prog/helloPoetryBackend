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

/**
 * Remove wrappers de tipo:
 * - Promise<>
 * - unions
 * - arrays
 */
function extractBaseType(type: string): string | null {
	if (!type) return null;

	let t = type.trim();

	if (t === 'null' || t === 'void') return null;

	// remove Promise<>
	if (t.startsWith('Promise<') && t.endsWith('>')) {
		t = t.slice(8, -1);
	}

	// pega apenas o primeiro da union
	if (t.includes('|')) {
		t = t.split('|')[0]!.trim();
	}

	// remove array
	if (t.endsWith('[]')) {
		t = t.replace('[]', '');
	}

	// primitives
	if (['string', 'number', 'boolean', 'any', 'unknown', 'object'].includes(t)) {
		return null;
	}

	// valida identificador TS
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t)) {
		return null;
	}

	return t;
}

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

		interfaceDeclaration.addMethod({
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
			const baseType = extractBaseType(ret);

			if (!baseType) continue;

			ensureNamedImport(filePath, baseType, modelsImportBasePath, true);
		}
	}

	return interfaceDeclaration;
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
