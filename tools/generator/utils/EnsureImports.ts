import { readFile, writeFile } from 'fs/promises';

/**
 * Garante que os imports de tipos ou valores existam e estejam atualizados.
 *
 * @param filePath Caminho do arquivo a ser atualizado
 * @param importPath Caminho do módulo a importar
 * @param identifiers Lista de nomes a importar
 * @param isType Se true, cria `import type`, senão `import`
 */
export async function ensureImports(
	filePath: string,
	importPath: string,
	identifiers: string[],
	isType: boolean = false,
): Promise<string> {
	let content: string;
	try {
		content = await readFile(filePath, 'utf-8');
	} catch {
		await writeFile(filePath, '', 'utf-8');
		content = '';
	}

	const importRegex = new RegExp(
		`import\\s+${isType ? 'type\\s+' : ''}\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${importPath}['"]`,
	);

	const existingMatch = content.match(importRegex);
	let existingIdentifiers: string[] = [];
	if (existingMatch) {
		existingIdentifiers = existingMatch[1]!
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	// Adiciona novos identificadores sem duplicar
	const allIdentifiers = Array.from(
		new Set([...existingIdentifiers, ...identifiers]),
	);

	// Remove import antigo e cria novo
	content = content.replace(importRegex, '').trimStart();
	const newImport = allIdentifiers.length
		? `import${isType ? ' type' : ''} { ${allIdentifiers.join(', ')} } from '${importPath}';\n`
		: '';

	return newImport + content;
}
