import { readFile, writeFile } from 'fs/promises';

/**
 * Ensure that the specified symbols are imported from a module.
 *
 * @param filePath Path of the file to update
 * @param importPath Module path to import from
 * @param symbolsToImport List of named exports to import
 * @param isType If true, generates `import type`, otherwise `import`
 * @returns Updated file content with ensured imports
 */
export async function ensureImportsExists(
	filePath: string,
	importPath: string,
	symbolsToImport: string[],
	isType: boolean = false,
): Promise<string> {
	let content = await readFileSafe(filePath);

	const currentImports = extractExistingImports(content, importPath, isType);

	const allImports = Array.from(
		new Set([...currentImports, ...symbolsToImport]),
	);

	content = removeOldImport(content, importPath, isType);

	const newImport = allImports.length
		? formatImport(allImports, importPath, isType)
		: '';

	return newImport + content;
}

//-------------------------------
// Helpers
//-------------------------------
async function readFileSafe(filePath: string): Promise<string> {
	try {
		return await readFile(filePath, 'utf-8');
	} catch {
		await writeFile(filePath, '', 'utf-8');
		return '';
	}
}

function extractExistingImports(
	content: string,
	importPath: string,
	isType: boolean,
): string[] {
	const regex = new RegExp(
		`import\\s+${isType ? 'type\\s+' : ''}\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${importPath}['"]`,
	);

	const match = content.match(regex);
	if (!match) return [];
	return match[1]!
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function removeOldImport(
	content: string,
	importPath: string,
	isType: boolean,
): string {
	const regex = new RegExp(
		`import\\s+${isType ? 'type\\s+' : ''}\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${importPath}['"];?\\s*`,
		'g',
	);
	return content.replace(regex, '').trimStart();
}

function formatImport(
	symbols: string[],
	importPath: string,
	isType: boolean,
): string {
	return `import${isType ? ' type' : ''} { ${symbols.join(', ')} } from '${importPath}';\n\n`;
}
