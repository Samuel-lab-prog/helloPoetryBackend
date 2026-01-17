import fs from 'fs';
import type { ClocData, DepcruiseData } from '../types/index';

export function loadDepcruiseData(path = 'depcruise.json'): DepcruiseData {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function loadClocData(path = 'cloc.json'): ClocData {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
