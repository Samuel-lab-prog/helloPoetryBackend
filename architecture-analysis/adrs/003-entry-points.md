# ADR-003: Entry points exclusion from fan-out metrics

## Status

Accepted at 2026-02-08

## Context

Files such as index.ts and application bootstrap files naturally aggregate
dependencies but do not represent business logic or behavioral coupling.

Including them in fan-out metrics caused false positives.

## Decision

- Entry-point files (e.g. \*/index.ts, src/index.ts) are excluded from fan-out
  metrics.
- Entry points are considered orchestration boundaries, not architectural units.

## Consequences

- Fan-out metrics better reflect real coupling.
- Entry points remain visible but are not penalized.
- Prevents misleading CI failures.
