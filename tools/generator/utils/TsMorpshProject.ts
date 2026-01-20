import { Project, QuoteKind } from 'ts-morph';

/**
 * Shared ts-morph project instance.
 *
 * A single Project instance should be reused across the entire
 * execution to keep formatting, symbol resolution, and performance
 * consistent.
 */
export const project = new Project({
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
  },
});