# Use Cases

This document describes how **use-cases** are structured, implemented, and
tested in this codebase.

Use-cases are the core of the application. They define **what the system does**
in response to a request, independent of delivery mechanisms, frameworks, or
infrastructure.

Normative constraints are defined in ADRs. This document explains how to apply
them in practice.

---

## What Is a Use Case

A use-case represents a **single application action** or business capability.

Examples:
- accept a friend request
- create an account
- publish a poem
- cancel a subscription

A use-case:
- orchestrates domain logic,
- enforces business rules,
- coordinates reads and writes through ports,
- returns a meaningful result or throws a domain error.

It is **not** a controller, service, or repository.

---

## Responsibilities

A use-case is responsible for:

- validating input at the application level,
- enforcing business invariants,
- querying current state when needed,
- executing state-changing commands,
- deciding *what happens next*.

A use-case is **not** responsible for:
- HTTP concerns,
- persistence details,
- framework-specific behavior,
- formatting responses for clients.

---

## Dependency Model

Use-cases depend only on:
- **domains** (models, domain errors),
- **ports** (interfaces for external interaction).

They must not depend on:
- adapters,
- frameworks,
- concrete infrastructure implementations.

Dependency direction:

Adapters → Use-cases → Domains


See:
- ADR-013 – Directional dependencies

---

## Factory Pattern for Use Cases

Use-cases must be created through **factory functions** that receive their
dependencies explicitly.

This enables:
- dependency inversion,
- testability,
- isolation from infrastructure.

### Recommended Pattern

```ts
import { SomePort, AnotherPort } from '../ports/*';
import type { SomeDomainModel } from '../Models';
import { SomeDomainError } from '../Errors';
import { SomePolicy } from '../Policies';

interface Dependencies {
	dependencyA: SomePort;
	dependencyB: AnotherPort;
}

export type SomeUseCaseParams = {
  // input parameters for the use-case
  // Is very important to export this type to help with typing in adapters and tests,
  // but we gonna talk abou this later.
};

export function someUseCaseFactory({ dependencyA, dependencyB }: Dependencies) {
	return async function someUseCase(params: SomeUseCaseParams): Promise<Result> {
		if(somethingIsWrong(params)) 
      throw new SomeDomainError('Invalid input');

    const someData = await dependencyA.fetchSomething(params);

    if(!SomePolicy.isSatisfied(someData)) 
      throw new SomeDomainError('Business rule violation');

    const result = await dependencyB.executeCommand(someData);
    return result;
    
	};
}
```

Key properties of this pattern:

- dependencies are injected once,
- the returned function is pure application logic,
- infrastructure is bound at the edges (infra and adapters).

This example demonstrates:

- explicit dependency injection,
- orchestration through ports,
- business rule enforcement,
- domain-level error signaling,
- no framework or adapter leakage.

## Error Handling

Use-cases signal failure by throwing domain or application errors.

Rules:

- errors must be meaningful and explicit,
- errors belong to the domain or application layer,
- adapters are responsible for translating errors to external representations
- (HTTP status codes, CLI output, etc.).

Use-cases must not:

- catch errors just to rethrow generic ones,
- return error codes or status objects.

## Naming and Scope

Guidelines:

- one use-case per file,
- one exported factory per use-case,
- names must describe an action (verb-based),
- avoid “manager”, “service”, or “handler” suffixes.

Good:
- acceptFriendRequest
- publishPoem

Bad:
- friendshipService
- userManager

## Testing Requirements

Every use-case must have a corresponding test file named **execute.test.ts**.

Tests must:

- invoke the use-case directly,
- mock or fake ports,
- cover success and failure scenarios,
- avoid adapters and entry points.

A use-case without tests is considered incomplete.

See:

ADR-006 – Use cases tests
ADR-007 – Domain tests

## What to Avoid

Use-cases must not:

- access databases directly,
- import adapters or frameworks,
- contain presentation logic,
- call other domains directly,
- hide dependencies through globals or singletons.

Violations are detected and enforced through CI.

## Some conventions

- Use-cases live in the **use-cases** directory.
- Each use-case is a folder containing:
  - `execute.ts` with the factory function,
  - `execute.test.ts` with tests.
- Use cases have a CQRS segregation:
  - commands (state-changing) in `commands/`
  - queries (read-only) in `queries/`
- Every use-cases folder has a Errors.ts file for domain-specific errors.
- Every use-cases folder has a Models.ts file for domain-specific types.
- Use-cases should not have subfolders unless necessary for complexity.
- You can apply CQRS in Models or Errors if needed, but it's not mandatory.
- All models are derived from schemas defined in the ports.
- Use-cases should not import models from other domains directly; they should go through ports.

## Summary

Use-cases are:

- the center of application behavior,
- explicit, testable, and deterministic,
- independent of infrastructure,
- governed by architectural rules.

Take a look at the ADRs for more details on the architectural decisions that govern use-cases. And remember: use-cases are not just a pattern, they are a fundamental architectural unit that shapes how the system evolves and maintains its integrity over time.