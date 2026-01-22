import {
	ClassDeclaration,
	InterfaceDeclaration,
	Project,
	SourceFile,
	SyntaxKind,
	TypeAliasDeclaration,
} from 'ts-morph';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export const project = new Project({
	tsConfigFilePath: 'tsconfig.json',
});

/**
 * Ensures that the directory for a given file path exists.
 * @param filePath Absolute or relative file path
 */
export function ensureDirectory(filePath: string): void {
	const dir = dirname(filePath);
	mkdirSync(dir, { recursive: true });
}

/**
 * Gets an existing source file or creates a new one if it does not exist.
 * The file is automatically added to the project.
 * @param project ts-morph Project instance
 * @param filePath Absolute or relative path to the source file
 * @returns SourceFile instance
 */
export function getOrCreateSourceFile(
	project: Project,
	filePath: string,
): SourceFile {
	const existing = project.getSourceFile(filePath);
	if (existing) return existing;

	if (existsSync(filePath)) {
		return project.addSourceFileAtPath(filePath);
	}

	ensureDirectory(filePath);
	return project.createSourceFile(filePath, '', { overwrite: false });
}

/**
 * Ensures that an interface exists in a file.
 * @param project ts-morph Project instance
 * @param filePath Path to the source file
 * @param interfaceName Interface name
 * @param isExported Whether the interface should be exported
 * @returns InterfaceDeclaration
 */
export function ensureInterface(
	project: Project,
	filePath: string,
	interfaceName: string,
	isExported = true,
): InterfaceDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);
	return (
		sourceFile.getInterface(interfaceName) ??
		sourceFile.addInterface({ name: interfaceName, isExported })
	);
}

/**
 * Ensures that a type alias exists in a source file.
 * If it does not exist, it will be created with the provided type expression.
 *
 * @param project ts-morph Project instance
 * @param filePath Path to the source file
 * @param typeName Type alias name
 * @param typeExpression TypeScript type expression
 * @param isExported Whether the type alias should be exported
 * @returns TypeAliasDeclaration
 */
export function ensureTypeAlias(
	project: Project,
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

/**
 * Ensures that a set of properties exist on a class, interface,
 * or object-shaped type alias.
 *
 * @param owner Class, interface, or type alias declaration
 * @param properties Property specifications
 */
export function ensureProperties(
	owner: ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration,
	properties: { name: string; type: string }[],
): void {
	if (owner instanceof TypeAliasDeclaration) {
		const typeNode = owner.getTypeNode();

		if (!typeNode || !typeNode.isKind(SyntaxKind.TypeLiteral)) {
			return;
		}

		const members = typeNode.getMembers();

		for (const prop of properties) {
			const exists = members.some(
				(m) =>
					m.isKind(SyntaxKind.PropertySignature) && m.getName() === prop.name,
			);

			if (!exists) {
				typeNode.addProperty({
					name: prop.name,
					type: prop.type,
				});
			}
		}

		return;
	}

	for (const prop of properties) {
		if (!owner.getProperty(prop.name)) {
			owner.addProperty({
				name: prop.name,
				type: prop.type,
			});
		}
	}
}
