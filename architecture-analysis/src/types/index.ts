import type { ICruiseResult } from 'dependency-cruiser';

export type CruiseResult = ICruiseResult;

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
	files: number;
	percent: number;
	zScore: number;
};

export type DomainAggregate = {
	loc: number;
	files: number;
};
