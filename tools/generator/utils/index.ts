import Handlebars from 'handlebars';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export function render(template: string, context: Record<string, unknown>) {
	const compiled = Handlebars.compile(template);
	return compiled(context);
}

const templateDir = 'tools/generator/templates';

export async function generateFile(
	tplPath: string,
	target: string,
	context: Record<string, unknown>,
) {
	const template = await readFile(join(templateDir, tplPath), 'utf-8');
	const rendered = render(template, context);
	await writeFile(target, rendered);
}

export function toCamelCase(value: string) {
	return value.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function toPascalCase(value: string) {
	const camel = toCamelCase(value);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
}

Handlebars.registerHelper('splitName', function (param: string) {
	return param.split(':')[0]!.trim();
});
