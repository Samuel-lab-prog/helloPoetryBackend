import Handlebars from 'handlebars';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { registerHandlebarsHelpers } from './HandleBarsHelpers';

const templateDir = 'tools/generator/templates';

/**
 * Compiles a Handlebars template with the given context.
 *
 * @param template Raw template string
 * @param context Context object
 * @returns Rendered string
 * @example
 * const template = "Hello, {{name}}!";
 * const context = { name: "World" };
 * const result = render(template, context);
 * console.log(result); // "Hello, World!"
 */
export function render(
	template: string,
	context: Record<string, unknown>,
): string {
	registerHandlebarsHelpers();
	const compiled = Handlebars.compile(template);
	return compiled(context);
}

/**
 * Reads a template file, renders it with context, and writes to target path.
 *
 * @param tplPath Path to template relative to templateDir
 * @param target Path to write rendered output
 * @param context Context object for template
 * @returns Promise that resolves when file is written
 * @example
 * await generateFile('example.tpl', 'output.txt', { name: 'World' });
 */
export async function generateFile(
	tplPath: string,
	target: string,
	context: Record<string, unknown>,
): Promise<void> {
	const template = await readFile(join(templateDir, tplPath), 'utf-8');
	const rendered = render(template, context);
	await writeFile(target, rendered, 'utf-8');
}
