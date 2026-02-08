import fs from 'fs';
import type { ClocResult, DepcruiseResult } from './Types';

/**
 * Loads and parses the dependency cruise result from a JSON file.
 * @param path The path to the depcruise JSON output (default: 'depcruise.json')
 * @returns The parsed DepcruiseResult object
 */
export function loadDepcruiseData(path = 'depcruise.json'): DepcruiseResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

/**
 * Loads and parses the cloc result from a JSON file.
 * @param path The path to the cloc JSON output (default: 'cloc.json')
 * @returns The parsed ClocResult object
 */
export function loadClocData(path = 'cloc.json'): ClocResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
