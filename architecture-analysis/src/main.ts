import { loadClocData, loadDepcruiseData } from './utils/Utils';
import { readFileSync } from 'node:fs';
import {
	evaluateArchitectureFindings,
	getArchitectureFindings,
	resetArchitectureFindings,
	type LegacyArchitectureFinding,
} from './utils/ArchitectureFindings';

import {
	printChangeAmplification,
	printDomainIsolation,
	printDomainCodeStats,
	printDomainDrivenStructure,
	printMainSeqDist,
	printDomainStatistics,
	printEndpointAndUseCaseTotals,
	printNoCircularDependencies,
	printTopFanIn,
	printHotspotModules,
	printTopFanOut,
	printNoCrossDomainCalls,
	printNoUntestedUsecase,
	printNoInvalidRootNamespaces,
	printNoRootSourceCode,
	printNoInvalidDirectionalDependencies,
	printNoMissingDirectories,
	printNoInvalidInfraDirectory,
	printNoInvalidRepositoryFiles,
	printNoInvalidUseCaseFolders,
	printNoInvalidUseCaseFolderNames,
	printNoMissingUseCaseBarrels,
	printNoInvalidPortsContent,
	printNoMissingSchemaBarrels,
	printNoExportedUseCaseDependencies,
	printNoInvalidUseCaseFactories,
	printNoInvalidUseCaseErrorImports,
	printNoCaseMismatchImports,
} from './metrics/Index';

function metrics(): void {
	resetArchitectureFindings();
	const depcruise = loadDepcruiseData();
	const cloc = loadClocData();

	printTopFanOut(depcruise);
	printTopFanIn(depcruise);
	printHotspotModules(depcruise, cloc);
	printDomainStatistics(cloc);
	printDomainIsolation(depcruise);
	printChangeAmplification();
	printMainSeqDist(cloc, depcruise);
	printDomainCodeStats(cloc);
	printEndpointAndUseCaseTotals(cloc);

	printDomainDrivenStructure(cloc);
	printNoCrossDomainCalls(depcruise);
	printNoCircularDependencies(depcruise);
	printNoInvalidRootNamespaces(depcruise);
	printNoRootSourceCode(depcruise);
	printNoInvalidDirectionalDependencies(depcruise);
	printNoUntestedUsecase(cloc);
	printNoMissingDirectories(cloc);
	printNoInvalidInfraDirectory(cloc);
	printNoInvalidRepositoryFiles(cloc);
	printNoInvalidUseCaseFolders(cloc);
	printNoInvalidUseCaseFolderNames(cloc);
	printNoMissingUseCaseBarrels(cloc);
	printNoExportedUseCaseDependencies(cloc);
	printNoInvalidUseCaseFactories(cloc);
	printNoInvalidUseCaseErrorImports(cloc);
	printNoInvalidPortsContent(cloc);
	printNoMissingSchemaBarrels(cloc);
	printNoCaseMismatchImports(cloc);

	if (process.env.ARCHITECTURE_CHECK === 'true') {
		const legacyFindings = JSON.parse(
			readFileSync(
				new URL('./governance/legacy-findings.json', import.meta.url),
				'utf8',
			),
		) as LegacyArchitectureFinding[];
		const evaluation = evaluateArchitectureFindings(
			getArchitectureFindings(),
			legacyFindings,
		);
		const blockingCount =
			evaluation.blocking.length + evaluation.staleLegacy.length;
		console.log(
			`Architecture governance: ${blockingCount} blocking error(s), ${evaluation.warnings.length} warning(s), ${evaluation.legacy.length} exact legacy finding(s).`,
		);
		for (const finding of evaluation.legacy)
			console.warn(
				`[legacy:${finding.severity}] ${finding.ruleId}: ${JSON.stringify(finding.finding)} (${finding.reason})`,
			);
		for (const finding of evaluation.blocking)
			console.error(
				`[error] ${finding.ruleId}: ${JSON.stringify(finding.finding)}`,
			);
		for (const finding of evaluation.warnings)
			console.warn(
				`[warning] ${finding.ruleId}: ${JSON.stringify(finding.finding)}`,
			);
		for (const stale of evaluation.staleLegacy)
			console.error(
				`[stale legacy exception] ${stale.ruleId}: ${JSON.stringify(stale.finding)}`,
			);
		if (blockingCount > 0) process.exitCode = 1;
	}
}

metrics();
