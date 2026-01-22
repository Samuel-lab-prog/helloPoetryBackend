import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureClass } from '../../utils/ensure-class/execute';
import { Scope } from 'ts-morph';

/**
 * Ensures that a DomainError class exists for a given error definition.
 *
 * @param filePath Path to the source file
 * @param error Error definition (name, type, message)
 * @returns ClassDeclaration
 */
export function ensureDomainErrorClass(
	filePath: string,
	error: {
		name: string;
		type: string;
		message: string;
	},
) {
	ensureNamedImport(filePath, 'DomainError', '@DomainError');

	return ensureClass(filePath, error.name, (cls) => {
		cls.setExtends('DomainError');

		cls.addConstructor({
			scope: Scope.Public,
			statements: [`super('${error.type}', '${error.message}');`],
		});
	});
}
