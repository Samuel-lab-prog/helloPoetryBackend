import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateArchitectureInputs } from '../architecture-analysis/src/utils/ArchitectureInputs';
import type {
	ClocResult,
	DepcruiseResult,
} from '../architecture-analysis/src/metrics/Types';

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
);
const temporaryRoot = path.resolve(os.tmpdir());
const temporaryPrefix = 'hello-poetry-architecture-';

function runBun(args: string[], env: NodeJS.ProcessEnv = process.env) {
	return spawnSync(process.execPath, args, {
		cwd: projectRoot,
		env,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
	});
}

function printProcessOutput(result: ReturnType<typeof runBun>): void {
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
}

function failOnProcessError(
	label: string,
	result: ReturnType<typeof runBun>,
): void {
	if (result.error)
		throw new Error(`${label} could not start: ${result.error.message}`);
	if (result.status !== 0)
		throw new Error(
			`${label} failed with exit code ${result.status ?? 'unknown'}.`,
		);
}

function createTemporaryDirectory(): string {
	const temporaryDirectory = mkdtempSync(
		path.join(temporaryRoot, temporaryPrefix),
	);
	const resolvedTemporaryDirectory = path.resolve(temporaryDirectory);
	if (
		path.dirname(resolvedTemporaryDirectory) !== temporaryRoot ||
		!path.basename(resolvedTemporaryDirectory).startsWith(temporaryPrefix)
	) {
		throw new Error(
			'Refusing to use an unexpected architecture-check temp directory.',
		);
	}
	return resolvedTemporaryDirectory;
}

function generateReports(directory: string): {
	clocPath: string;
	dependencyPath: string;
	dependencyResult: ReturnType<typeof runBun>;
} {
	const clocPath = path.join(directory, 'cloc.json');
	const dependencyPath = path.join(directory, 'depcruise.json');
	const cloc = runBun([
		'x',
		'cloc',
		'src',
		'--by-file',
		'--exclude-dir=node_modules,dist,build,coverage,prisma',
		'--json',
		'--out',
		clocPath,
		'--quiet',
	]);
	printProcessOutput(cloc);
	failOnProcessError('cloc', cloc);

	const dependencyResult = runBun([
		'x',
		'depcruise',
		'src',
		'--exclude',
		'node_modules|dist|coverage|src/generic-subdomains/persistance/prisma/generated',
		'--output-type',
		'json',
		'--output-to',
		dependencyPath,
	]);
	printProcessOutput(dependencyResult);
	if (dependencyResult.error)
		throw new Error(
			`dependency-cruiser could not start: ${dependencyResult.error.message}`,
		);
	return { clocPath, dependencyPath, dependencyResult };
}

function reportDependencyCruiser(
	dependencyData: DepcruiseResult,
	clocData: ClocResult,
): number {
	const inputSummary = validateArchitectureInputs(dependencyData, clocData);
	const errors = dependencyData.summary.violations.filter(
		(violation) => violation.rule?.severity === 'error',
	);
	const warnings = dependencyData.summary.violations.filter(
		(violation) => violation.rule?.severity === 'warn',
	);

	console.log(
		`dependency-cruiser analyzed ${inputSummary.moduleCount} modules; cloc analyzed ${inputSummary.sourceFileCount} source files (${inputSummary.sourceCodeLines} lines).`,
	);
	for (const violation of dependencyData.summary.violations) {
		const severity = violation.rule?.severity ?? 'info';
		console.log(
			`[dependency-cruiser:${severity}] ${violation.rule?.name}: ${violation.from} -> ${violation.to}`,
		);
	}
	console.log(
		`Dependency-cruiser: ${errors.length} error(s), ${warnings.length} warning(s).`,
	);
	return errors.length;
}

function runCustomArchitectureAnalysis(
	clocPath: string,
	dependencyPath: string,
): number {
	const analysis = runBun(['architecture-analysis/src/main.ts'], {
		...process.env,
		ARCHITECTURE_CHECK: 'true',
		CLOC_REPORT: clocPath,
		DEPCRUISE_REPORT: dependencyPath,
		ARCHITECTURE_REPORT: '',
	});
	printProcessOutput(analysis);
	return analysis.error || analysis.status !== 0 ? 1 : 0;
}

function runArchitectureCheck(): number {
	const resolvedTemporaryDirectory = createTemporaryDirectory();
	let exitCode: number;
	try {
		const reports = generateReports(resolvedTemporaryDirectory);
		const dependencyData = JSON.parse(
			readFileSync(reports.dependencyPath, 'utf8'),
		) as DepcruiseResult;
		const clocData = JSON.parse(
			readFileSync(reports.clocPath, 'utf8'),
		) as ClocResult;
		const dependencyExitCode = reportDependencyCruiser(
			dependencyData,
			clocData,
		);
		const cruiserProcessFailed = reports.dependencyResult.status !== 0;
		exitCode = Math.max(
			dependencyExitCode,
			cruiserProcessFailed ? 1 : 0,
			runCustomArchitectureAnalysis(reports.clocPath, reports.dependencyPath),
		);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		exitCode = 1;
	} finally {
		if (
			path.dirname(resolvedTemporaryDirectory) === temporaryRoot &&
			path.basename(resolvedTemporaryDirectory).startsWith(temporaryPrefix)
		) {
			rmSync(resolvedTemporaryDirectory, { recursive: true, force: true });
		}
	}

	return exitCode;
}

process.exitCode = runArchitectureCheck();
