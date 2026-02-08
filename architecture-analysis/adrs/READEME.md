# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) that document key
architectural decisions, their rationale, and their enforcement strategy.

These decisions are not merely descriptive: whenever possible, they are designed
to be **measurable, automatable, and enforced through CI tooling**. Together,
they define the architectural boundaries, constraints, and quality signals of
the system.

## Index

- [ADR-001 – Domain-based structure](001-domain-structure.md)
- [ADR-002 – Fan-out limits](002-fanout-limits.md)
- [ADR-003 – Entry points exclusion](003-entry-points.md)
- [ADR-004 – Change amplification thresholds](004-change-amplification.md)
- [ADR-005 – Domain isolation rules](005-domain-isolation.md)
- [ADR-006 – Use cases tests](006-usecase-tests.md)
- [ADR-007 – Domain tests](007-domain-tests.md)
- [ADR-008 – Domain size limits](008-domain-size.md)
- [ADR-009 – Distance from main sequence](009-mainseq-dist.md)
- [ADR-010 – No cross-domain calls](010-no-cross-domain-calls.md)
- [ADR-011 – No invalid namespaces](011-no-invalid-namespace.md)
- [ADR-012 – No source code at root](012-no-src-code-at-root.md)
- [ADR-013 – Directional dependencies](013-directional-deps.md)
- [ADR-014 – Mandatory domain folders](014-mandatory-domain-folders.md)
- [ADR-015 – Prohibition of circular dependencies](015-circular-deps.md)
- [ADR-016 – Linting rules](016-linting.md)
- [ADR-017 – Mandatory code formatting](017-formatting.md)
- [ADR-018 – Reproducible and deterministic builds](018-build.md)
- [ADR-019 – CI as a gatekeeper](019-ci-as-gatekeeper.md)
- [ADR-020 – Architectural metrics](020-arch-metrics.md)
