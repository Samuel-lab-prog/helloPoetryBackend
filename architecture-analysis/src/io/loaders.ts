import fs from 'fs';
import type { ClocData, CruiseResult } from '../types/index';

export function loadDepcruiseData(path = 'depcruise.json'): CruiseResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function loadClocData(path = 'cloc.json'): ClocData {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
