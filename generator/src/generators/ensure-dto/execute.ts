import { existsSync, mkdirSync } from 'fs';
import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';
import { join } from 'path';

type DtoInput = {
	filePath: string; // caminho final do Dtos.ts
	functionName: string; // nome da função DTO, ex: toAuthorPoem
	inputModel: string; // tipo de input
	outputModel: string; // tipo de output
	inputPath: string; // caminho relativo do input model
	outputPath: string; // caminho relativo do output model
};

export function ensureDtoFile(dto: DtoInput) {
	const {
		filePath,
		functionName,
		inputModel,
		outputModel,
		inputPath,
		outputPath,
	} = dto;

	const dir = join(filePath, '..');
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	// Imports
	ensureNamedImport(filePath, inputModel, inputPath, true);
	ensureNamedImport(filePath, outputModel, outputPath, true);

	// Função DTO
	const fn = ensureFunction(filePath, functionName, {
		isExported: true,
		parameters: [
			{
				name: inputModel.charAt(0).toLowerCase() + inputModel.slice(1),
				type: inputModel,
			},
		],
	});

	const paramName = inputModel.charAt(0).toLowerCase() + inputModel.slice(1);

	fn.setBodyText(
		`
return {
  // TODO: map ${inputModel} to ${outputModel}
  ...${paramName}
};
`.trim(),
	);
	fn.setReturnType(outputModel);
}
