import type { ClocResult, DepcruiseResult } from '../metrics/Types';

export type ArchitectureInputSummary = {
	moduleCount: number;
	sourceFileCount: number;
	sourceCodeLines: number;
};

export function validateArchitectureInputs(
	dependencyData: DepcruiseResult,
	clocData: ClocResult,
): ArchitectureInputSummary {
	if (!Array.isArray(dependencyData.modules))
		throw new Error('dependency-cruiser returned no modules array.');
	const sourceModules = dependencyData.modules.filter((module) =>
		/^src\//.test(module.source ?? ''),
	);
	if (sourceModules.length === 0)
		throw new Error('dependency-cruiser analyzed zero source modules.');
	if (
		!Number.isInteger(dependencyData.summary?.totalCruised) ||
		dependencyData.summary.totalCruised < dependencyData.modules.length ||
		!Number.isInteger(dependencyData.summary.totalDependenciesCruised) ||
		!Array.isArray(dependencyData.summary.violations)
	) {
		throw new Error(
			'dependency-cruiser returned an incomplete analysis summary.',
		);
	}
	const severityCounts = {
		error: dependencyData.summary.violations.filter(
			(violation) => violation.rule?.severity === 'error',
		).length,
		warn: dependencyData.summary.violations.filter(
			(violation) => violation.rule?.severity === 'warn',
		).length,
		info: dependencyData.summary.violations.filter(
			(violation) => violation.rule?.severity === 'info',
		).length,
		ignore: dependencyData.summary.violations.filter(
			(violation) => violation.rule?.severity === 'ignore',
		).length,
	};
	if (
		!Number.isInteger(dependencyData.summary.error) ||
		!Number.isInteger(dependencyData.summary.warn) ||
		!Number.isInteger(dependencyData.summary.info) ||
		!Number.isInteger(dependencyData.summary.ignore) ||
		dependencyData.summary.error !== severityCounts.error ||
		dependencyData.summary.warn !== severityCounts.warn ||
		dependencyData.summary.info !== severityCounts.info ||
		dependencyData.summary.ignore !== severityCounts.ignore
	) {
		throw new Error(
			'dependency-cruiser severity counts do not match its findings.',
		);
	}

	const clocSummary = clocData.SUM;
	if (
		!clocSummary ||
		!Number.isInteger(clocSummary.nFiles) ||
		clocSummary.nFiles <= 0 ||
		!Number.isInteger(clocSummary.code) ||
		clocSummary.code <= 0
	) {
		throw new Error('cloc returned an empty or incomplete source summary.');
	}

	return {
		moduleCount: sourceModules.length,
		sourceFileCount: clocSummary.nFiles,
		sourceCodeLines: clocSummary.code,
	};
}
