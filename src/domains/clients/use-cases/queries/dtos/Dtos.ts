import type { FullClient, ClientSummary } from '../models/Index';

export function toClientSummary(input: FullClient): ClientSummary {
	return {
		clientId: input.clientId,
		clientName: input.clientName,
	};
}
