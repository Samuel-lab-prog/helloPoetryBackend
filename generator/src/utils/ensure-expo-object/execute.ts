import { VariableDeclarationKind, VariableDeclaration } from 'ts-morph';
import { getOrCreateSourceFile, project } from '../helpers/execute';

type Options = {
	filePath: string;
	objectName: string;
	content: string;
	type?: string;
};

export function ensureExportedObject(ctx: Options): VariableDeclaration {
	const sourceFile = getOrCreateSourceFile(project, ctx.filePath);
	const obj = sourceFile.getVariableDeclaration(ctx.objectName);
	if (!obj) {
		return sourceFile
			.addVariableStatement({
				isExported: true,
				declarationKind: VariableDeclarationKind.Const,
				declarations: [
					{
						name: ctx.objectName,
						initializer: ctx.content,
						type: ctx.type ?? 'any',
					},
				],
			})
			.getDeclarations()[0]!;
	}
	return obj;
}
