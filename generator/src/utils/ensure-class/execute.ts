import { ClassDeclaration, SourceFile } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

type EnsureClassFactory = (
	classDecl: ClassDeclaration,
	sourceFile: SourceFile,
) => void;

/**
 * Ensures that a class exists in a source file.
 * If it does not exist, it will be created and configured.
 *
 * @param filePath Path to the source file
 * @param className Class name
 * @param factory Callback to configure the class when it is created
 * @returns ClassDeclaration
 */
export function ensureClass(
	filePath: string,
	className: string,
	factory?: EnsureClassFactory,
): ClassDeclaration {
	const sourceFile = getOrCreateSourceFile(project, filePath);

	const existingClass = sourceFile.getClass(className);
	if (existingClass) {
		return existingClass;
	}

	const classDecl = sourceFile.addClass({
		name: className,
		isExported: true,
	});

	factory?.(classDecl, sourceFile);

	return classDecl;
}
