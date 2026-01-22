import {
	ClassDeclaration,
	InterfaceDeclaration,
	SyntaxKind,
	TypeAliasDeclaration,
} from 'ts-morph';

type PropertySpec = {
	name: string;
	type: string;
};

/**
 * Ensures that a set of properties exist on a class, interface,
 * or object-shaped type alias.
 *
 * If the owner is a type alias, it must be a type literal.
 *
 * @param owner Class, interface, or type alias declaration
 * @param properties Property specifications
 * @returns The updated owner declaration, or undefined if the type alias is not object-shaped
 */
export function ensureProperties(
	owner: ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration,
	properties: PropertySpec[],
): ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration | undefined {
	if (owner instanceof TypeAliasDeclaration) {
		const typeNode = owner.getTypeNode();

		if (!typeNode?.isKind(SyntaxKind.TypeLiteral)) {
			return;
		}

		for (const prop of properties) {
			const exists = typeNode
				.getMembers()
				.some(
					(m) =>
						m.isKind(SyntaxKind.PropertySignature) && m.getName() === prop.name,
				);

			if (!exists) {
				typeNode.addProperty(prop);
			}
		}

		return owner;
	}

	for (const prop of properties) {
		if (!owner.getProperty(prop.name)) {
			owner.addProperty(prop);
		}
	}

	return owner;
}
