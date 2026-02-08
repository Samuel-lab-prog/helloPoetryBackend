/**
 * Given a file path, determines if it is an abstract file based on certain conventions or content.
 * @param path The file path
 * @param content Optional content of the file to check for abstract declarations
 * @returns True if the file is considered abstract, false otherwise
 */
export function isAbstractFile(path: string, content?: string): boolean {
	return (
		path.includes('/ports/') ||
		path.includes('\\ports\\') ||
		(content?.includes('interface ') ?? false) ||
		(content?.includes('abstract class') ?? false)
	);
}

/**
 * Given a file path, extracts the domain name based on the convention of being under src/domains or src/generic-subdomains.
 * @param path The file path
 * @returns The domain name
 */
export function extractDomainFromPath(path: string): string | null {
	const match = path.match(
		/(?:^|\/|\\)src[/\\](domains|generic-subdomains)[/\\]([^/\\]+)[/\\]/,
	);
	return match ? match[2]! : null;
}

/**
 * Given a file path, determines if it is a test file based on common test file suffixes.
 * @param path The file path
 * @returns True if the file is a test file, false otherwise
 */
export function isTestFile(path: string): boolean {
	return path.endsWith('.test.ts') || path.endsWith('.spec.ts');
}

export type DomainKind = 'CORE' | 'UTILITY' | 'INFRA_SHARED';

/**
 * Classifies the domain into one of the predefined DomainKind categories.
 * @param domain The domain name to classify
 * @returns The DomainKind classification
 */
export function classifyDomainKind(domain: string): DomainKind {
	if (domain === 'utils') return 'UTILITY';
	if (domain === 'persistance' || domain === 'authentication')
		return 'INFRA_SHARED';
	return 'CORE';
}

/**
 * Determines if the given path belongs to a generic subdomain.
 * @param path The file path
 * @returns True if the path is within a generic subdomain, false otherwise
 */
export function isGenericSubdomain(path: string): boolean {
	return path.startsWith('src/generic-subdomains/');
}

/**
 * Extracts the root namespace from a given file path.
 * @param path The file path
 * @returns The root namespace or null if not found
 */
export function extractRootNamespace(path: string): string | null {
	const match = path.match(/^src\/([^/]+)\//);
	return match?.[1] ?? null;
}

/**
 * Determines if the given path is a root-level source file.
 * @param path The file path
 * @returns True if the path is a root-level source file, false otherwise
 */
export function isRootLevelSourceFile(path: string): boolean {
	return /^src\/[^/]+\.(ts|js)$/.test(path);
}
