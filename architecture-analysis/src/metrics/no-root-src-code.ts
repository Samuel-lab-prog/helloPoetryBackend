/* eslint-disable @typescript-eslint/no-explicit-any */

type Violation = {
	module: string;
};

function isRootLevelSourceFile(path: string): boolean {
	/**
	 * Matches:
	 *  src/file.ts
	 *  src/file.js
	 *
	 * Does NOT match:
	 *  src/domains/...
	 *  src/generic-subdomains/...
	 */
	return /^src\/[^/]+\.(ts|js|tsx|jsx)$/.test(path);
}

export function checkNoRootSourceCode(cruiseResult: any): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;

		if (isRootLevelSourceFile(source)) {
			violations.push({ module: source });
		}
	}

	return violations;
}
