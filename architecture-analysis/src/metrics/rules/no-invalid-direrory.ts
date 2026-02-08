import { red, green, yellow } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printTable, type TableColumn } from '../../PrintTable';

type Violation = {
	domain: string;
	path: string;
	missingFolders: string[];
};

const REQUIRED_FOLDERS = ['use-cases', 'ports', 'adapters'];

const DOMAIN_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkPortsAndAdaptersStructure(
	cloc: ClocResult,
): Violation[] {
	const domains = new Map<
		string,
		{
			domain: string;
			path: string;
			folders: Set<string>;
		}
	>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(DOMAIN_REGEX);
		if (!match) continue;

		const [, , domainName, rest] = match;
		const domainPath = `src/domains/${domainName}`;

    if(!rest) continue;
		const firstFolder = rest.split('/')[0];

		const entry =
			domains.get(domainPath) ??
			{
				domain: domainName,
				path: domainPath,
				folders: new Set<string>(),
			};

		if (firstFolder) 
			entry.folders.add(firstFolder);
		
    if(!entry)
		  domains.set(domainPath, entry);
	}

	const violations: Violation[] = [];

	for (const domain of domains.values()) {
		const missing = REQUIRED_FOLDERS.filter(
			(f) => !domain.folders.has(f),
		);

		if (missing.length > 0) {
			violations.push({
				domain: domain.domain,
				path: domain.path,
				missingFolders: missing,
			});
		}
	}

	return violations;
}

export function printPortsAndAdaptersViolations(
	cloc: ClocResult,
): void {
	const violations = checkPortsAndAdaptersStructure(cloc);

	if (violations.length === 0) {
		console.log(
			green('✔ All domains follow ports & adapters structure'),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'DOMAIN',
			width: 25,
			render: (v) => ({
				text: v.domain,
				color: red,
			}),
		},
		{
			header: 'DOMAIN PATH',
			width: 55,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'MISSING FOLDERS',
			width: 35,
			render: (v) => ({
				text: v.missingFolders.join(', '),
				color: yellow,
			}),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({
				text: 'VIOLATION',
				color: red,
			}),
		},
	];

	printTable(
		`Ports & Adapters violations (${violations.length})`,
		columns,
		violations,
	);
}
