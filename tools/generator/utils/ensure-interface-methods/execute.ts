import { project } from '../TsMorpshProject';

export interface Method {
  name: string;
  parameters: { name: string; type: string }[];
  returnTypes: string[];
}

/**
 * Ensures that a repository interface exists and contains all required methods.
 *
 * Behavior:
 * - Opens or creates the target file.
 * - Ensures the repository interface exists.
 * - Adds missing method signatures to the interface.
 * - Does NOT remove or modify existing methods.
 * - Operation is idempotent.
 *
 * The interface name is inferred from the file path:
 * - Files containing "Commands" → CommandsRepository
 * - Otherwise → QueriesRepository
 *
 * This function operates at the AST level using ts-morph,
 * avoiding regex-based parsing and string manipulation.
 *
 * @param filePath - Path to the repository interface file
 * @param repositoryMethods - List of methods to ensure
 *
 * @example
 * await ensureRepositoryInterfaceMethods(
 *   'src/domains/user/repositories/CommandsRepository.ts',
 *   methods
 * );
 */
export async function ensureRepositoryInterfaceMethods(
  filePath: string,
	interfaceName: string,
  repositoryMethods: Method[],
): Promise<void> {
  const sourceFile = project.createSourceFile(
    filePath,
    '',
    { overwrite: false }
  );

  let repoInterface = sourceFile.getInterface(interfaceName);

  // Create interface if it does not exist
  if (!repoInterface) {
    repoInterface = sourceFile.addInterface({
      name: interfaceName,
      isExported: true,
    });
  }

  const existingMethodNames = new Set(
    repoInterface.getMethods().map((m) => m.getName())
  );

  for (const method of repositoryMethods) {
    if (existingMethodNames.has(method.name)) {
      continue;
    }

    repoInterface.addMethod({
      name: method.name,
      parameters: [
        {
          name: 'params',
          type: method.parameters.length
            ? `{ ${method.parameters
                .map((p) => `${p.name}: ${p.type}`)
                .join('; ')} }`
            : undefined,
        },
      ].filter(Boolean),
      returnType: `Promise<${method.returnTypes.join(' | ')}>`,
    });
  }

  await sourceFile.save();
}
