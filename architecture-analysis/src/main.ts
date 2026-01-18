import { loadClocData, loadDepcruiseData } from './io/loaders';
import {
	calculateFanIn,
	calculateFanOut,
	printTopFanOut,
	printHotspotModules,
	printTopFanIn,
} from './metrics/dependency-metrics';
import { buildLocMap, attachLocToFanOut } from './metrics/loc-metrics';
import {
	calculateDomainLoc,
	calculateDomainStatistics,
	printDomainStatistics,
} from './metrics/domain-statistics';
import { printNoCrossDomainCalls } from './metrics/rules/no-cross-domain-calls';
import { printDomainIsolation } from './metrics/domain-isolation';
import { printChangeAmplification } from './metrics/change-amp';

import { printNoInvalidRootNamespaces } from './metrics/rules/no-invalid-namespaces';
import { printNoRootSourceCode } from './metrics/rules/no-root-src-code';
import { printNoInvalidDirectionalDependencies } from './metrics/rules/no-invalid-directional-dependencies';

function runDependencyAnalysis(): void {
	const depcruise = loadDepcruiseData();
	const cloc = loadClocData();

	const fanOut = calculateFanOut(depcruise);
	const fanIn = calculateFanIn(depcruise);

	const locMap = buildLocMap(cloc);
	const fanOutWithLoc = attachLocToFanOut(fanOut, locMap);

	const domainLoc = calculateDomainLoc(cloc);
	const domainStats = calculateDomainStatistics(domainLoc, cloc.SUM.code);

	printTopFanOut(fanOut);
	printTopFanIn(fanIn);
	printHotspotModules(fanOutWithLoc);
	printDomainStatistics(domainStats);
	printDomainIsolation(depcruise);

	printChangeAmplification();

	printNoCrossDomainCalls(depcruise);
	printNoInvalidRootNamespaces(depcruise);
	printNoRootSourceCode(depcruise);
	printNoInvalidDirectionalDependencies(depcruise);
}

runDependencyAnalysis();
