import { detectDirectionalViolations } from '../metrics/directional-rule';
import type { DepcruiseData } from '../types';
import { section } from '../ui/console-format';

export function printDirectionalViolations(depcruiseData: DepcruiseData): void {
	section('Directional dependency violations');
	const violations = detectDirectionalViolations(depcruiseData);

	if (violations.length === 0) {
		console.log('✔ No violations detected');
		return;
	}

	console.log(`✖ ${violations.length} violation(s)\n`);

	violations.forEach((v) => {
		console.log(
			`• ${v.fromLayer} → ${v.toLayer}\n` +
				`  from: ${v.from}\n` +
				`  to:   ${v.to}\n`,
		);
	});
}
