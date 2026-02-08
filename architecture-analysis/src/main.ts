import { loadClocData, loadDepcruiseData } from './Loaders';

import {
	calculateFanIn,
	calculateFanOut,
	printTopFanOut,
	printHotspotModules,
	printTopFanIn,
} from './metrics/dependency-metrics';

import { buildLocMap, attachLocToFanOut } from './metrics/loc-metrics';

import {
	calculateDomainAggregates,
	calculateDomainStatistics,
	printDomainStatistics,
} from './metrics/domain-statistics';

import { printNoCrossDomainCalls } from './metrics/rules/no-cross-domain-calls';
import { printDomainIsolation } from './metrics/domain-isolation';
import { printChangeAmplification } from './metrics/change-amp';
import { printOverallStats } from './metrics/overall-view';
import {
	printInstabilityAbstraction,
	calculateAbstractionInstability,
} from './metrics/abstraction-instability';

import { printNoInvalidRootNamespaces } from './metrics/rules/no-invalid-namespaces';
import { printNoRootSourceCode } from './metrics/rules/no-root-src-code';
import { printNoInvalidDirectionalDependencies } from './metrics/rules/no-invalid-directional-dependencies';

function metrics(): void {
	const depcruise = loadDepcruiseData();
	const cloc = loadClocData();

	const fanOut = calculateFanOut(depcruise);
	const fanIn = calculateFanIn(depcruise);
	const locMap = buildLocMap(cloc);
	const fanOutWithLoc = attachLocToFanOut(fanOut, locMap);
	const domainAggregates = calculateDomainAggregates(cloc);
	const archMetrics = calculateAbstractionInstability(cloc, depcruise);
	const totalLoc = cloc.SUM.code;
	const domainMetrics = calculateDomainStatistics(domainAggregates, totalLoc);

	printTopFanOut(fanOut);
	printTopFanIn(fanIn);
	printHotspotModules(fanOutWithLoc);
	printDomainStatistics(domainMetrics);
	printDomainIsolation(depcruise);
	printChangeAmplification();
	printInstabilityAbstraction(archMetrics);

	printNoCrossDomainCalls(depcruise);
	printNoInvalidRootNamespaces(depcruise);
	printNoRootSourceCode(depcruise);
	printNoInvalidDirectionalDependencies(depcruise);
	printOverallStats(cloc);
}

metrics();
