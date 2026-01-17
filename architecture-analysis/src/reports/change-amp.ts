import { calculateChangeAmplification } from '../metrics/change-amp';
import { divider, padLeft, padRight, section } from '../ui/console-format';

export function printChangeAmplification(): void {
	const metrics = calculateChangeAmplification(100);
	section('Change amplification');

	const COL_DOMAIN = 30;
	const COL_COMMITS = 10;
	const COL_AVG = 14;
	const COL_MAX = 10;

	console.log(
		padRight('DOMAIN', COL_DOMAIN) +
			padLeft('COMMITS', COL_COMMITS) +
			padLeft('AVG FILES', COL_AVG) +
			padLeft('MAX FILES', COL_MAX),
	);

	console.log(divider('·'));

	[...metrics]
		.sort((a, b) => b.avgFilesChanged - a.avgFilesChanged)
		.forEach((m) => {
			console.log(
				padRight(m.domain, COL_DOMAIN) +
					padLeft(String(m.commits), COL_COMMITS) +
					padLeft(m.avgFilesChanged.toFixed(2), COL_AVG) +
					padLeft(String(m.maxFilesChanged), COL_MAX),
			);
		});
}
