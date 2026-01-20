import { project } from '../TsMorpshProject';

/**
 * Ensures that a named import declaration exists in a TypeScript file.
 *
 * Behavior:
 * - Opens the file if it exists, or creates it if it does not.
 * - Ensures that all provided symbols are imported from the given module.
 * - Deduplicates symbols automatically.
 * - Preserves existing imports, comments, and formatting.
 * - Supports both `import {}` and `import type {}`.
 * - Operation is idempotent: running it multiple times yields the same file.
 *
 * This function operates at the AST level using ts-morph, avoiding
 * string manipulation, regex parsing, or manual content rewriting.
 *
 * @param filePath - Path to the TypeScript file to update
 * @param moduleSpecifier - Module path to import from (e.g. `@/errors`)
 * @param namedImports - List of named symbols to ensure
 * @param isTypeOnly - Whether the import should be `import type`
 *
 * @example
 * // Adds: import { DomainError } from '@/errors';
 * await ensureNamedImportDeclaration(
 *   'src/use-cases/create-user.ts',
 *   '@/errors',
 *   ['DomainError']
 * );
 *
 * @example
 * // Adds or updates: import type { UserDTO } from '@/dtos';
 * await ensureNamedImportDeclaration(
 *   'src/use-cases/create-user.ts',
 *   '@/dtos',
 *   ['UserDTO'],
 *   true
 * );
 */
export async function ensureNamedImportDeclaration(
  filePath: string,
  moduleSpecifier: string,
  namedImports: string[],
  isTypeOnly: boolean = false,
): Promise<void> {
  const sourceFile = project.createSourceFile(
    filePath,
    '',
    { overwrite: false }
  );

  // Try to find an existing import declaration with the same module specifier
  // and the same type (value import vs type-only import).
  const existingImport = sourceFile
    .getImportDeclarations()
    .find(
      (imp) =>
        imp.getModuleSpecifierValue() === moduleSpecifier &&
        imp.isTypeOnly() === isTypeOnly
    );

  if (!existingImport) {
    // No import from this module yet → create a new one
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports,
      isTypeOnly,
    });
  } else {
    // Merge existing named imports with the new ones
    const currentImports = existingImport
      .getNamedImports()
      .map((ni) => ni.getName());

    const merged = Array.from(
      new Set([...currentImports, ...namedImports])
    );

    existingImport.removeNamedImports();
    existingImport.addNamedImports(merged);
  }

  await sourceFile.save();
}
