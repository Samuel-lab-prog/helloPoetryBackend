import { red, green } from 'kleur/colors';
import type { DepcruiseResult } from '../../types';
import { padRight, divider } from '../../ui/console-format';

type Violation = {
	module: string;
};

function isRootLevelSourceFile(path: string): boolean {
	return /^src\/[^/]+\.(ts|js)$/.test(path);
}

const ALLOWED_ROOT_FILES = ['src/index.ts'];

function checkNoRootSourceCode(cruiseResult: DepcruiseResult): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;

		if (isRootLevelSourceFile(source) && !ALLOWED_ROOT_FILES.includes(source)) {
			violations.push({ module: source });
		}
	}

	return violations;
}

export function printNoRootSourceCode(cruiseResult: DepcruiseResult): void {
	const violations = checkNoRootSourceCode(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ No source files found at src root'));
		return;
	}

	console.log(
		red(`✖ ${violations.length} source file(s) found at src root\n`),
	);

	// header
	console.log(padRight('MODULE', 60));
	console.log(divider('·'));

	// rows
	for (const v of violations) {
		console.log(red(padRight(v.module, 60)));
	}
}
