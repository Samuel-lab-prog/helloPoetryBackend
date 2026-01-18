# ADR-005: Domain isolation rules

## Status

Accepted

## Context

Well-isolated domains reduce ripple effects and allow independent evolution.
Domain isolation can be measured by the percentage of external dependencies.

## Decision

Domain isolation is classified as:

- STRONG: ≤ 15% external dependencies
- OK: 16–30% external dependencies
- WEAK: > 30% external dependencies

Domains classified as WEAK will fail the CI pipeline.

## Consequences

- Encourages clear ownership and boundaries.
- Makes architectural drift measurable.
- Provides early warnings before domains become entangled.
