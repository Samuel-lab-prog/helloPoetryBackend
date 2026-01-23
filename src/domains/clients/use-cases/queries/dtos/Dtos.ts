import type { FullClient } from '../models/FullClient';
import type { ClientSummary } from '../models/ClientSummary';

export function toClientSummary(input: FullClient): ClientSummary {
	return {
		clientId: input.clientId,
		clientName: input.clientName,
	};
}
