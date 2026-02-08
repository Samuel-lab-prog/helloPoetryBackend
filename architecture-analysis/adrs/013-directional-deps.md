# ADR-013: Directional Dependency Rules

## Status

Accepted at 2026-02-08

## Context

Layered architectures rely on strict dependency direction to preserve separation
of concerns. Violations of dependency direction often introduce tight coupling,
hidden cycles, and reduced testability.

Without enforcement, directional rules tend to be violated incrementally,
leading to long-term architectural degradation.

## Decision

- Dependencies must respect the predefined architectural direction.
- Invalid directional dependencies are **not allowed**.
- Any detected violation causes the CI pipeline to **fail**.
- Dependency direction rules must be explicitly defined and machine-enforced.

## Consequences

- Prevents dependency cycles and architectural shortcuts.
- Preserves layer responsibilities.
- Makes architectural intent explicit and enforceable.
- Some refactoring may be required to fix existing directional violations.
- Enables architectural metrics such as:
  - number of directional violations
  - change amplification due to directional dependencies
