import { TypeAliasDeclaration } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

/**
 * Ensures that a type alias exists in a source file.
 * If it does not exist, it will be created with the provided type expression.
 *
 * @param filePath Path to the source file
 * @param typeName Type alias name
 * @param typeExpression TypeScript type expression
 * @param isExported Whether the type alias should be exported
 * @returns TypeAliasDeclaration
 */
export function ensureTypeAlias(
	filePath: string,
	typeName: string,
	typeExpression: string,
	isExported = true,
): TypeAliasDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	return (
		sourceFile.getTypeAlias(typeName) ??
		sourceFile.addTypeAlias({
			name: typeName,
			type: typeExpression,
			isExported,
		})
	);
}
