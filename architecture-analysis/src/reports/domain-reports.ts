import type { DomainMetric } from '../types';
import { padLeft, padRight, divider, section } from '../ui/console-format';

export function printDomainStatistics(metrics: DomainMetric[]): void {
	section('Domain size distribution');

	console.log(
		padRight('DOMAIN', 30) +
			padLeft('LOC', 10) +
			padLeft('% TOTAL', 12) +
			padLeft('Z-SCORE', 10),
	);

	console.log(divider('·'));

	[...metrics]
		.sort((a, b) => b.loc - a.loc)
		.forEach((m) =>
			console.log(
				padRight(m.domain, 30) +
					padLeft(String(m.loc), 10) +
					padLeft((m.percent * 100).toFixed(1) + '%', 12) +
					padLeft(m.zScore.toFixed(2), 10),
			),
		);
}
