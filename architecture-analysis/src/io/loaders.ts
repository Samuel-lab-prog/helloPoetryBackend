import fs from 'fs';
import type { ClocResult, DepcruiseResult } from '../types/index';

export function loadDepcruiseData(path = 'depcruise.json'): DepcruiseResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function loadClocData(path = 'cloc.json'): ClocResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
