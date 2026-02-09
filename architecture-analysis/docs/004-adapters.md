# Adapters

This document explains the role, responsibilities, and constraints of
**adapters** in this codebase.

Adapters are responsible for translating **external inputs** into application
use-cases and wiring together concrete implementations of ports.

They form the outermost layer of the system.

---

## What Is an Adapter

An adapter is a module that:

- receives requests from the outside world,
- validates and normalizes input,
- invokes use-cases,
- maps outputs to external responses.

Adapters do **not** contain business logic.

They exist to connect the application to external systems while preserving clean
dependency boundaries.

---

## Adapter Ownership

Adapters are part of the delivery layer and live in the `adapters/` directory.

Structure:

adapters/ ├─ queries/ │ ├─ Services.ts │ └─ QueriesRouter.ts └─ commands/ ├─
Services.ts └─ CommandsRouter.ts

Rules:

- Adapters may depend on ports, schemas, and use-cases.
- Adapters must not be depended on by any other layer.
- Adapters must not depend on infrastructure implementations directly.

See:

- ADR-013 – Directional dependencies

---

## Commands vs Queries

Adapters are split by **intent**, mirroring the use-cases and ports structure.

### Command Adapters

- Trigger state changes.
- Perform validations for write operations.
- Call command use-cases.

### Query Adapters

- Perform read-only operations.
- Call query use-cases.
- Must not cause side effects.

This separation ensures:

- clearer mental models,
- easier enforcement of read/write boundaries,
- reduced accidental coupling.

---

## Responsibilities of Adapters

Adapters are responsible for:

- input validation (syntax and shape),
- routing and orchestration,
- dependency wiring,
- mapping use-case results to external formats.

Adapters are **not** responsible for:

- business rules,
- persistence logic,
- cross-use-case coordination.

If logic becomes reusable or domain-related, it belongs elsewhere.

---

## Routers

Router files define **how external requests are mapped to services**.

Examples:

- `QueriesRouter.ts`
- `CommandsRouter.ts`

Routers:

- define routes or entry points,
- extract raw input,
- delegate to services.

Routers must remain thin and free of logic.

---

## Services

Service files act as **application-facing façades** for adapters.

Examples:

- `adapters/queries/Services.ts`
- `adapters/commands/Services.ts`

Services:

- validate inputs using schemas,
- instantiate use-cases,
- inject concrete port implementations,
- return normalized responses.

Services may contain:

- orchestration logic,
- dependency composition.

Services must not:

- embed business rules,
- bypass use-cases to call repositories directly.

---

## Dependency Injection

Adapters are the primary location where **dependency injection occurs**.

Typical flow:

1. Adapter receives external input.
2. Adapter resolves port implementations.
3. Adapter constructs the use-case.
4. Adapter executes the use-case.
5. Adapter maps the output.

This keeps use-cases:

- framework-agnostic,
- easy to test,
- isolated from infrastructure concerns.

---

## Interaction with Ports

Adapters:

- depend on port interfaces,
- choose which implementation to use,
- pass implementations into use-cases.

Adapters must never:

- redefine port contracts,
- expose infrastructure types upward,
- leak persistence details.

See:

- `ports/QueriesRepository.ts`
- `ports/CommandsRepository.ts`

---

## Interaction with Infrastructure

Adapters are allowed to import **concrete infrastructure implementations**, but
only for wiring purposes.

Rules:

- adapters choose implementations,
- infrastructure never chooses adapters,
- use-cases never know implementations exist.

At no point does infrastructure reference adapters or use-cases.

---

## Validation and Schemas

Adapters use schemas to validate external input before invoking use-cases.

Rules:

- schemas are used only at boundaries,
- use-cases assume validated input,
- validation errors are handled by adapters.

---

## Error Handling

Adapters:

- catch and map use-case errors,
- translate them into external error formats,
- avoid leaking internal error types.

Use-case errors should be:

- domain-specific,
- explicit,
- mapped at the adapter level.

---

## Testing Strategy

Adapters are tested with:

- mocked use-cases,
- stubbed port implementations.

Focus of adapter tests:

- correct routing,
- correct dependency wiring,
- correct error mapping.

Adapters should not be tested for business correctness.

---

## What Adapters Must Not Do

Adapters must not:

- implement business rules,
- perform persistence logic,
- call repositories directly,
- coordinate multiple use-cases.

Violations here usually indicate misplaced logic.

---

## Summary

Adapters:

- are the system’s entry points,
- translate external input to application calls,
- enforce clean boundaries,
- keep business logic isolated and testable.

When unsure:

> If the code is about _how to talk to the outside world_, it belongs in an
> adapter.
