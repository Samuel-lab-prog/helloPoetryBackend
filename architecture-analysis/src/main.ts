import { loadClocData, loadDepcruiseData } from './io/loaders';
import { calculateFanIn, calculateFanOut } from './metrics/dependency-metrics';
import { buildLocMap, attachLocToFanOut } from './metrics/loc-metrics';
import {
	calculateDomainLoc,
	calculateDomainStatistics,
} from './metrics//domain-statistics';
import { printDomainNamespaceIntegrity } from './metrics/domain-namespace';
import {
	printTopFanOut,
	printTopFanIn,
	printHotspotModules,
} from './reports/dependency-reports';
import { printDomainStatistics } from './reports/domain-reports';
import { printRootNamespaceRestriction } from './reports/domain-namspace-violation';
import { printNoRootSourceCode } from './reports/no-root-src-code';
import { printDomainIsolation } from './reports/domain-isolation';
import { printDirectionalViolations } from './reports/directional-rule';
import { printChangeAmplification } from './reports/change-amp';

export function runDependencyAnalysis(): void {
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
	printDomainNamespaceIntegrity(depcruise);
	printRootNamespaceRestriction(depcruise);
	printNoRootSourceCode(depcruise);
	printDomainIsolation(depcruise);
	printDirectionalViolations(depcruise);
	printChangeAmplification();
}

runDependencyAnalysis();
