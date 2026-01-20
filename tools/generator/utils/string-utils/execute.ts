/**
 * Converts a kebab-case string to camelCase.
 *
 * @param value Input string
 * @example
 * toCamelCase('hello-world'); // returns 'helloWorld'
 */
export function toCamelCase(value: string): string {
	return value.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * Converts a kebab-case string to PascalCase.
 *
 * @param value Input string
 * @example
 * toPascalCase('hello-world'); // returns 'HelloWorld'
 */
export function toPascalCase(value: string): string {
	const camel = toCamelCase(value);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
}
