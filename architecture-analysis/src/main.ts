import { loadClocData, loadDepcruiseData } from './Loaders';

import {
	printChangeAmplification,
	printDomainIsolation,
	printDomainCodeStats,
	printMainSeqDist,
	printDomainStatistics,
	printTopFanIn,
	printHotspotModules,
	printTopFanOut,
	printNoCrossDomainCalls,
	printNoUntestedUsecase,
	printNoInvalidRootNamespaces,
	printNoRootSourceCode,
	printNoInvalidDirectionalDependencies,
	printNoMissingDirectories,
} from './metrics/Index';

function metrics(): void {
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

	printNoCrossDomainCalls(depcruise);
	printNoInvalidRootNamespaces(depcruise);
	printNoRootSourceCode(depcruise);
	printNoInvalidDirectionalDependencies(depcruise);
	printNoUntestedUsecase(cloc);
	printNoMissingDirectories(cloc);
}

metrics();
