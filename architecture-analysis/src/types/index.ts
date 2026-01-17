export type DepcruiseModule = {
	source: string;
	dependencies: { resolved: string }[];
};

export type DepcruiseData = {
	modules: DepcruiseModule[];
};

export type ClocFileInfo = {
	code?: number;
};

export type ClocData = Record<string, ClocFileInfo> & {
	SUM: { code: number };
};

export type FanMetric = {
	module: string;
	dependencies: number;
	loc?: number;
};

export type DomainMetric = {
	domain: string;
	loc: number;
	percent: number;
	zScore: number;
};
