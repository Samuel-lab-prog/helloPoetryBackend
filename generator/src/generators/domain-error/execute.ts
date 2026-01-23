import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureClass } from '../../utils/ensure-class/execute';
import { Scope } from 'ts-morph';
import { join } from 'path';

function ensureDomainErrorClass(
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

export function generateDomainErrors(
	domainPath: string,
	kind: string,
	errors: { name: string; type: string; message: string }[],
) {
	const errorsFilePath = join(domainPath, 'use-cases', kind, 'Errors.ts');
	for (const error of errors) {
		ensureDomainErrorClass(errorsFilePath, error);
	}
}
