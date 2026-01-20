import { SourceFile } from 'ts-morph';

/**
 * Ensures that an export declaration exists in the given SourceFile.
 *
 * Behavior:
 * - If an export with the same moduleSpecifier already exists, nothing changes.
 * - Otherwise, a new export declaration is added.
 * - Idempotent.
 *
 * This function:
 * - Operates only on the AST
 * - Does NOT read or write files
 * - Does NOT create SourceFiles
 *
 * @param sourceFile - ts-morph SourceFile instance
 * @param moduleSpecifier - Module path used in the export
 * @param namedExports - Optional named exports
 */
export function ensureExportDeclarationInSourceFile(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedExports?: string[],
): void {
  const existingExport = sourceFile
    .getExportDeclarations()
    .find(
      ed => ed.getModuleSpecifierValue() === moduleSpecifier
    );

  if (existingExport) return;

  sourceFile.addExportDeclaration({
    moduleSpecifier,
    namedExports,
  });
}
