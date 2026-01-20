import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Reads a file safely. If the file does not exist, creates it with optional initial content.
 *
 * @param filePath Path to the file
 * @param initialContent Content to write if the file does not exist
 * @returns File content
 */
export async function readFileSafe(
	filePath: string,
	initialContent: string = '',
): Promise<string> {
	try {
		return await readFile(filePath, 'utf-8');
	} catch {
		await writeFileSafe(filePath, initialContent);
		return initialContent;
	}
}

/**
 * Writes content to a file, creating directories if they do not exist.
 *
 * @param filePath Path to the file
 * @param content Content to write
 */
export async function writeFileSafe(
	filePath: string,
	content: string,
): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, content, 'utf-8');
}

/**
 * Ensures that the specified symbols are imported from a module.
 * Adds missing imports and removes old duplicates.
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

function extractExistingImports(
	content: string,
	importPath: string,
	isType: boolean,
): string[] {
	const regex = new RegExp(
		`import\\s+${isType ? 'type\\s+' : ''}\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${importPath}['"]`,
		'g',
	);

	const matches = [...content.matchAll(regex)];
	if (!matches.length) return [];

	return matches
		.flatMap((match) => match[1]!.split(','))
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
