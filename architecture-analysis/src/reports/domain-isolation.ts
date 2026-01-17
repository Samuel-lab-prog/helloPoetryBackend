/* eslint-disable @typescript-eslint/no-explicit-any */
import { padLeft, padRight, section, divider } from '../ui/console-format';
import { calculateDomainIsolation } from '../metrics/domain-isolation';

export function printDomainIsolation(depcruiseData: any): void {
	section('Domain isolation strength');
	const metrics = calculateDomainIsolation(depcruiseData);

	const COL_DOMAIN = 30;
	const COL_INT = 10;
	const COL_EXT = 10;
	const COL_PCT = 12;

	console.log(
		padRight('DOMAIN', COL_DOMAIN) +
			padLeft('INT', COL_INT) +
			padLeft('EXT', COL_EXT) +
			padLeft('% EXT', COL_PCT),
	);

	console.log(divider('·'));

	[...metrics]
		.sort((a, b) => b.externalPercent - a.externalPercent)
		.forEach((m) => {
			console.log(
				padRight(m.domain, COL_DOMAIN) +
					padLeft(String(m.internalDeps), COL_INT) +
					padLeft(String(m.externalDeps), COL_EXT) +
					padLeft((m.externalPercent * 100).toFixed(1) + '%', COL_PCT),
			);
		});
}
