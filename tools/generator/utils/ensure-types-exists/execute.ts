import {
  Project,
  QuoteKind,
  SyntaxKind,
} from 'ts-morph';

const project = new Project({
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
  },
});

export interface TypeScriptType {
  name: string;
  properties: Record<string, string>;
}

/**
 * Ensures that an exported TypeScript type alias exists and
 * contains all required properties.
 *
 * - Creates the file if it does not exist
 * - Creates the type alias if it does not exist
 * - Adds missing properties
 * - Preserves existing properties
 * - Idempotent
 */
export async function ensureExportedTypeAlias(
  filePath: string,
  typeDef: TypeScriptType,
): Promise<void> {
  const sourceFile = project.createSourceFile(
    filePath,
    '',
    { overwrite: false }
  );

  let typeAlias = sourceFile.getTypeAlias(typeDef.name);

  if (!typeAlias) {
    typeAlias = sourceFile.addTypeAlias({
      name: typeDef.name,
      isExported: true,
      type: '{}',
    });
  }

  let typeNode = typeAlias.getTypeNode();

  // Force literal if something unexpected exists
  if (!typeNode || !typeNode.isKind(SyntaxKind.TypeLiteral)) {
    typeAlias.setType('{}');
    typeNode = typeAlias.getTypeNodeOrThrow();
  }

  const literal = typeNode.asKindOrThrow(SyntaxKind.TypeLiteral);

  const existingProps = new Set(
    literal.getMembers()
      .filter(m => m.isKind(SyntaxKind.PropertySignature))
      .map(m => m.getName())
  );

  for (const [name, type] of Object.entries(typeDef.properties)) {
    if (existingProps.has(name)) continue;

    literal.addProperty({
      name,
      type,
    });
  }

  await sourceFile.save();
}
