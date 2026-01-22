import {
	ClassDeclaration,
	InterfaceDeclaration,
	SyntaxKind,
	TypeAliasDeclaration,
} from 'ts-morph';

/**
 * Ensures that a set of properties exist on a class, interface,
 * or object-shaped type alias.
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
