export interface Method {
	name: string;
	parameters: { name: string; type: string }[];
	returnTypes: string[];
}

/**
 * Ensures that all repository methods exist in the interface.
 * Adds missing methods, deduplicates existing ones.
 */
export function ensureInterfaceMethods(
	filePath: string,
	content: string,
	repositoryMethods: Method[],
): string {
	const interfaceMatch = content.match(
		/export\s+interface\s+\w+\s*{([\s\S]*?)^}/m,
	);

	if (!interfaceMatch) {
		// Interface does not exist: create a default one
		const interfaceName = filePath.includes('Commands')
			? 'CommandsRepository'
			: 'QueriesRepository';
		const methodsText = repositoryMethods.map(formatMethod).join('');
		return (
			`export interface ${interfaceName} {\n${methodsText}}\n` +
			(content ? '\n' + content : '')
		);
	}

	const interfaceBody = interfaceMatch[1]!;

	const newMethods = repositoryMethods
		.filter((m) => !methodExists(interfaceBody, m.name))
		.map(formatMethod)
		.join('');

	if (!newMethods) return content;

	const updatedInterfaceBody = interfaceBody.trimEnd() + '\n' + newMethods;

	return content.replace(interfaceBody, updatedInterfaceBody);
}

/**
 * Checks if a method already exists in the interface
 */
function methodExists(interfaceBody: string, methodName: string): boolean {
	const regex = new RegExp(`\\b${methodName}\\s*\\(`, 'm');
	return regex.test(interfaceBody);
}

/**
 * Formats a method for insertion into the interface
 */
function formatMethod(method: Method): string {
	const hasParameters = method.parameters.length > 0;
	if (!hasParameters) {
		const returnType = method.returnTypes.join(' | ');
		return `  ${method.name}(): Promise<${returnType}>;\n`;
	}
	const params = method.parameters
		.map((p) => `${p.name}: ${p.type}`)
		.join(', ');
	const returnType = method.returnTypes.join(' | ');
	return `  ${method.name}(params: { ${params} }): Promise<${returnType}>;\n`;
}
