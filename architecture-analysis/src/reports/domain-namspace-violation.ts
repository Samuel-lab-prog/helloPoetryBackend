/* eslint-disable @typescript-eslint/no-explicit-any */
import { bold, red, yellow } from 'kleur/colors';
import { checkRootNamespaceRestriction } from '../metrics/root-namespace-restriction';

export function printRootNamespaceRestriction(cruiseResult: any) {
	const violations = checkRootNamespaceRestriction(cruiseResult);

	console.log('\n' + bold('ROOT NAMESPACE RESTRICTION'));
	console.log('────────────────────────────────────────────────────────');

	if (violations.length === 0) {
		console.log('✔ All root namespaces are valid');
		return;
	}

	console.log(red(`✖ ${violations.length} invalid root namespace(s)\n`));

	for (const v of violations) {
		console.log(yellow(`• ${v.rootNamespace}`) + ` → ${v.module}`);
	}
}
