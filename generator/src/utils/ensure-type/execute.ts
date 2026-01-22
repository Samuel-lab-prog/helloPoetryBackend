import { TypeAliasDeclaration } from 'ts-morph';
import {
	getOrCreateSourceFile,
	project,
	objectToTypeLiteral,
} from '../helpers/execute';

/**
 * Ensures that a type alias exists in a source file.
 * If it does not exist, it will be created with the provided type expression.
 *
 * @param filePath Path to the source file
 * @param typeName Type alias name
 * @param properties Object representing the properties of the type alias
 * @param isExported Whether the type alias should be exported
 * @returns TypeAliasDeclaration
 */
export function ensureTypeAlias(
	filePath: string,
	typeName: string,
	properties: Record<string, string>,
	isExported = true,
): TypeAliasDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	const hasType = sourceFile.getTypeAlias(typeName);
	if (hasType) {
		hasType.remove();
	}

	return sourceFile.addTypeAlias({
		name: typeName,
		type: objectToTypeLiteral(properties),
		isExported,
	});
}
