# Architecture Overview

This document describes how the codebase is organized and how architectural
decisions are applied in practice.

It is intended as a **practical guide** for understanding, navigating, and
extending the system. Normative rules and enforcement details are documented in
the Architecture Decision Records (ADRs). This document focuses on *how to work
within those decisions*.

---

## Architectural Style

The system follows a **domain-oriented architecture**.

Instead of organizing code by technical layers (e.g. controllers, services,
repositories), the codebase is structured around **business domains**. Each
domain represents a cohesive area of responsibility and is expected to evolve
largely independently.

This approach prioritizes:
- explicit boundaries,
- reduced coupling,
- localized change,
- and long-term maintainability.

See:
- ADR-001 – Domain-based structure
- ADR-005 – Domain isolation rules

---

## High-Level Structure

At a high level, the system is composed of:

- **Domains**  
  Encapsulate business rules, policies, and invariants.

- **Use-cases**  
  Orchestrate application behavior by coordinating domain logic and external
  interactions through ports.

- **Ports**  
  Define interfaces for communication between domains and with external systems.

- **Adapters**  
  Handle interaction with external systems (HTTP, persistence, CLI, messaging,
  etc.).

- **Infrastructure**  
  Contains shared technical concerns (e.g. logging, configuration, utilities).

Each of these has a clearly defined responsibility and a restricted dependency
direction.

---

## Dependency Direction

Dependencies must follow a strict direction:

Adapters → Use-cases → Domains

- Domains must not depend on use-cases or adapters.
- Use-cases may depend on domains, but not on adapters.
- Adapters depend on use-cases and translate external input/output.

Violations of dependency direction are detected and enforced automatically.

See:
- ADR-013 – Directional dependencies
- ADR-015 – Prohibition of circular dependencies

---

## Domain Boundaries

Domains are treated as **architectural units**, not just folders.

Key principles:
- No direct calls between domains.
- Cross-domain interaction must be explicit and intentional.
- Domains may duplicate code rather than introduce coupling.

Domain size, isolation, and dependency health are continuously measured and
classified.

See:
- ADR-008 – Domain size limits
- ADR-010 – No cross-domain calls
- ADR-015 – Prohibition of circular dependencies

---

## Entry Points and Isolation

Entry points (e.g. application bootstrap, main modules, controllers) are
considered volatile and must be kept isolated from business logic.

Business rules must not leak into:
- entry points,
- framework-specific code,
- or infrastructural glue.

Distance from entry points is treated as an architectural signal and measured
automatically.

See:
- ADR-003 – Entry points exclusion
- ADR-009 – Distance from main sequence

---

## CQRS

The system follows a Command Query Responsibility Segregation (CQRS) pattern.
- **Commands** represent operations that change state and are handled by use-cases.
- **Queries** represent operations that read state and are handled by separate
  use-cases.

This separation promotes clear intent, better testability, and more flexible
evolution of read and write paths.

---

## Testing Philosophy

Testing is an architectural concern, not an afterthought.

Key principles:
- Every use-case must be explicitly tested.
- Domains are expected to have a minimum level of internal test coverage.
- External tests (integration, E2E) complement but do not replace internal tests.

Testability is treated as a signal of architectural health and is enforced
through CI.

See:
- ADR-006 – Use cases tests
- ADR-007 – Domain tests

---

## Automation and Enforcement

Architectural rules in this system are **not advisory**.

Wherever possible, they are:
- measurable,
- automated,
- and enforced through the CI pipeline.

If CI fails due to an architectural rule, the system is considered invalid,
regardless of manual review.

See:
- ADR-016 – Linting rules
- ADR-017 – Mandatory code formatting
- ADR-018 – Reproducible and deterministic builds
- ADR-019 – CI as a gatekeeper

---

## Architecture as a Living System

Architecture in this system is expected to evolve deliberately.

Changes to architectural rules must be:
- documented as ADRs,
- reviewed explicitly,
- and reflected in tooling when applicable.

Architectural metrics are treated as first-class signals to guide evolution,
not as absolute measures of quality.

See:
- ADR-020 – Architectural metrics
