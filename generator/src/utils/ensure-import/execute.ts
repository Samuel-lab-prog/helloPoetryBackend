import { ImportDeclaration } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

/**
 * Ensures that a named import exists in a source file.
 * If the import declaration does not exist, it will be created.
 * If it exists but is missing the named import, it will be added.
 *
 * @param filePath Path to the source file
 * @param importName Named import identifier (e.g. "User")
 * @param moduleSpecifier Module specifier (e.g. "./user")
 * @returns ImportDeclaration
 */
export function ensureNamedImport(
	filePath: string,
	importName: string,
	moduleSpecifier: string,
	isTypeOnly = false,
): ImportDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	const existingImport = sourceFile
		.getImportDeclarations()
		.find((imp) => imp.getModuleSpecifierValue() === moduleSpecifier);

	if (!existingImport) {
		return sourceFile.addImportDeclaration({
			moduleSpecifier,
			namedImports: [importName],
			isTypeOnly,
		});
	}

	const namedImports = existingImport.getNamedImports();
	const alreadyImported = namedImports.some(
		(ni) => ni.getName() === importName,
	);

	if (!alreadyImported) {
		existingImport.addNamedImport(importName);
	}

	return existingImport;
}
