/* eslint-disable @typescript-eslint/no-explicit-any */
import { bold, red } from 'kleur/colors';
import { checkNoRootSourceCode } from '../metrics/no-root-src-code';

export function printNoRootSourceCode(cruiseResult: any) {
	const violations = checkNoRootSourceCode(cruiseResult);

	console.log('\n' + bold('NO ROOT SOURCE CODE'));
	console.log('────────────────────────────────────────────────────────');

	if (violations.length === 0) {
		console.log('✔ No source files found at src root');
		return;
	}

	console.log(
		red(`✖ ${violations.length} source file(s) found at src root\n`),
	);

	for (const v of violations) {
		console.log(`• ${v.module}`);
	}
}
