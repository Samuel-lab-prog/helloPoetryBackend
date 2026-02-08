import { red, green } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printTable, type TableColumn } from '../../PrintTable';

type Violation = {
	domain: string;
	useCasePath: string;
	executeFile: string;
};

const USE_CASE_PATH_REGEX =
	/^src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/].+[\\/]/;

function extractDomain(path: string): string | null {
	const match = path.match(
		/^src[\\/](domains|generic-subdomains)[\\/]([^\\/]+)[\\/]/,
	);
	return match ? match[2]! : null;
}

function getDirectory(path: string): string {
	return path.replace(/[\\/][^\\/]+$/, '');
}

export function checkMissingExecuteTests(cloc: ClocResult): Violation[] {
	const folders = new Map<
		string,
		{
			domain: string;
			hasExecute: boolean;
			hasTest: boolean;
			executeFile?: string;
		}
	>();

	for (const [file, info] of Object.entries(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		if (!('code' in info)) continue;
		if (!USE_CASE_PATH_REGEX.test(file)) continue;

		const dir = getDirectory(file);
		const domain = extractDomain(file) ?? 'root';

		const entry = folders.get(dir) ?? {
			domain,
			hasExecute: false,
			hasTest: false,
		};

		if (file.endsWith('execute.ts')) {
			entry.hasExecute = true;
			entry.executeFile = file;
		}

		if (file.endsWith('execute.test.ts')) {
			entry.hasTest = true;
		}

		folders.set(dir, entry);
	}

	const violations: Violation[] = [];

	for (const [dir, data] of folders.entries()) {
		if (data.hasExecute && !data.hasTest) {
			violations.push({
				domain: data.domain,
				useCasePath: dir,
				executeFile: data.executeFile!,
			});
		}
	}

	return violations;
}

export function printMissingExecuteTests(cloc: ClocResult): void {
	const violations = checkMissingExecuteTests(cloc);

	if (violations.length === 0) {
		console.log(green('✔ All use-cases have execute.test.ts'));
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
			header: 'USE-CASE PATH',
			width: 70,
			render: (v) => ({ text: v.useCasePath }),
		},
		{
			header: 'EXECUTE FILE',
			width: 50,
			render: (v) => ({ text: v.executeFile }),
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
		`Missing execute.test.ts (${violations.length})`,
		columns,
		violations,
	);
}
