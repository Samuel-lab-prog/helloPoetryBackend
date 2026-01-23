import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';
import { join } from 'path';

type DtoInput = {
	filePath: string;
	functionName: string;
	inputModel: string;
	outputModel: string;
	inputPath: string;
	outputPath: string;
	body: string;
};

function ensureDtoFile(dto: DtoInput) {
	const {
		filePath,
		functionName,
		inputModel,
		outputModel,
		inputPath,
		outputPath,
		body,
	} = dto;

	ensureNamedImport(filePath, inputModel, inputPath, true);
	ensureNamedImport(filePath, outputModel, outputPath, true);

	const fn = ensureFunction(filePath, functionName, {
		isExported: true,
		parameters: [
			{
				name: 'input',
				type: inputModel,
			},
		],
	});

	fn.setBodyText(
		`
${body}
`.trim(),
	);
	fn.setReturnType(outputModel);
}

export function generateDTOs(
	domainPath: string,
	kind: 'commands' | 'queries',
	dtos?: { inputModel: string; outputModel: string; body: string }[],
) {
	if (!dtos) return;
	const dtosDir = join(domainPath, 'use-cases', kind, 'dtos');
	const dtoFilePath = join(dtosDir, 'Dtos.ts');
	for (const dto of dtos) {
		ensureDtoFile({
			filePath: dtoFilePath,
			functionName: `to${dto.outputModel}`,
			inputModel: dto.inputModel,
			outputModel: dto.outputModel,
			inputPath: `../models/Index`,
			outputPath: `../models/Index`,
			body: dto.body,
		});
	}
}
