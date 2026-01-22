import { ensureNamedImport } from '../../utils/ensure-import/execute';
import { ensureFunction } from '../../utils/ensure-function/execute';

type DtoInput = {
	filePath: string;
	functionName: string;
	inputModel: string;
	outputModel: string;
	inputPath: string;
	outputPath: string;
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

	ensureNamedImport(filePath, inputModel, inputPath, true);
	ensureNamedImport(filePath, outputModel, outputPath, true);

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
