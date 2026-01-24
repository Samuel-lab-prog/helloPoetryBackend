import { InterfaceDeclaration } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

/**
 * Ensures that an interface exists in a file.
 * @param filePath Path to the source file
 * @param interfaceName Interface name
 * @param isExported Whether the interface should be exported
 * @returns InterfaceDeclaration
 */
export function ensureInterface(
	filePath: string,
	interfaceName: string,
	isExported = true,
	content?: string,
): InterfaceDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);
	return (
		sourceFile.getInterface(interfaceName) ??
		sourceFile.addInterface({
			name: interfaceName,
			isExported,
			...(content ? { statements: content } : {}),
		})
	);
}
