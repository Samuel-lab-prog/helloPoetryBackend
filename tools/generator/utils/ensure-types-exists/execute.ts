import { readFileSafe, writeFileSafe } from '../files-utils/execute';

export interface TypeScriptType {
	name: string;
	properties: Record<string, string>;
}

/**
 * Ensures that a TypeScript type exists in a file.
 * - Creates the file if it doesn't exist.
 * - Adds missing properties if the type already exists.
 * - Deduplicates properties.
 *
 * @param filePath Path to the TypeScript file
 * @param iface Type definition
 */
export async function ensureType(
	filePath: string,
	iface: TypeScriptType,
): Promise<void> {
	let content = await readFileSafe(filePath, '');

	const typeRegex = new RegExp(
		`export\\s+type\\s+${iface.name}\\s*=\\s*{([\\s\\S]*?)};`,
		'm',
	);

	const existingProps: Record<string, string> = {};

	const match = content.match(typeRegex);
	if (match && match[1]) {
		match[1].split('\n').forEach((line) => {
			const propMatch = line.trim().match(/^(\w+)\s*:\s*(.+);$/);
			if (propMatch && propMatch[1] && propMatch[2]) {
				existingProps[propMatch[1]] = propMatch[2];
			}
		});
	}

	const mergedProps = { ...existingProps, ...iface.properties };
	const propsContent = Object.entries(mergedProps)
		.map(([key, type]) => `\t${key}: ${type};`)
		.join('\n');

	const typeContent = `export type ${iface.name} = {\n${propsContent}\n};\n`;

	if (match) {
		content = content.replace(typeRegex, typeContent.trim());
	} else {
		content = (content.trim() ? content + '\n\n' : '') + typeContent;
	}

	await writeFileSafe(filePath, content);
}
