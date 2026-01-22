import { ExportDeclaration } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

/**
 * Ensures that a barrel export (`export * from 'path'`) exists in a source file.
 * If it does not exist, it will be created.
 *
 * @param filePath Path to the index.ts (or any source file)
 * @param barrelPath Module specifier to export from
 * @returns ExportDeclaration
 */
export function ensureBarrelExport(
	filePath: string,
	barrelPath: string,
): ExportDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	const existing = sourceFile
		.getExportDeclarations()
		.find(
			(decl) =>
				decl.getModuleSpecifierValue() === barrelPath &&
				decl.getNamedExports().length === 0,
		);

	if (existing) {
		return existing;
	}

	return sourceFile.addExportDeclaration({
		moduleSpecifier: barrelPath,
	});
}
