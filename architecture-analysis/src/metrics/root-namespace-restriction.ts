/* eslint-disable @typescript-eslint/no-explicit-any */

type Violation = {
	module: string;
	rootNamespace: string;
};

const ALLOWED_ROOT_NAMESPACES = new Set(['domains', 'generic-subdomains']);

function extractRootNamespace(path: string): string | null {
	const match = path.match(/^src\/([^/]+)\//);
	return match?.[1] ?? null;
}

export function checkRootNamespaceRestriction(cruiseResult: any): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;

		if (!source.startsWith('src/')) continue;

		const rootNamespace = extractRootNamespace(source);
		if (!rootNamespace) continue;

		if (!ALLOWED_ROOT_NAMESPACES.has(rootNamespace)) {
			violations.push({
				module: source,
				rootNamespace,
			});
		}
	}

	return violations;
}
