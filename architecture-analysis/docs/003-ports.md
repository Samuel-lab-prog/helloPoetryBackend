# Ports

This document describes how **ports** are defined, used, and implemented in this
codebase.

Ports are the **formal boundary** between application logic (use-cases and
domains) and external concerns such as persistence, APIs, or infrastructure.

They are a core mechanism for enforcing dependency direction and testability.

---

## What Is a Port

A port is a **TypeScript interface** that defines how the application
_communicates outward_.

Ports:

- are owned by the application layer,
- describe required behavior, not implementations,
- are consumed by use-cases,
- are implemented by adapters or infrastructure modules.

Ports never contain logic. They only define contracts.

---

## Port Ownership and Location

All ports live in the dedicated `ports/` directory.

Example: ports/ ├─ QueriesRepository.ts └─ CommandsRepository.ts

Rules:

- Ports belong to the application, not to adapters or infra.
- Ports must not import from adapters, infra, or frameworks.
- Ports may import **application-level types** (models, DTOs).

This ensures that dependency direction always points inward.

See:

- ADR-013 – Directional dependencies

---

## Read vs Write Separation

Ports are split by **intent**, not by technical concerns.

This codebase follows a clear separation between:

- **Query ports** (read-only)
- **Command ports** (state-changing)

Example:

- `QueriesRepository`
- `CommandsRepository`

This separation:

- makes side effects explicit,
- simplifies reasoning about behavior,
- improves testability,
- aligns with use-case intent.

---

## Example: QueriesRepository Port

```ts
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../use-cases/Models';

export interface QueriesRepository {
	selectActiveBanByUserId(params: {
		userId: number;
	}): Promise<BannedUserResponse | null>;

	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<SuspendedUserResponse | null>;
}
```

Key properties:

- the port defines what is needed, not how it is retrieved,
- return types are explicit and application-owned,
- nullable results are encoded in the type system,
- no infrastructure details leak into the interface.

## Who Uses Ports

Use-cases Use-cases depend on ports to:

query current state, perform state transitions.

Use-cases must:

- receive ports via dependency injection,
- treat ports as opaque abstractions,
- never assume implementation details.

See:

use-cases/commands use-cases/queries

## Implementations

Ports are implemented by:

- adapters (adapters/commands, adapters/queries),
- infrastructure modules (infra/\*-repository)

- must fully satisfy the port interface,
- may depend on frameworks, ORMs, or external services,
- must not introduce additional application logic.

## Adapters and Ports

Adapters act as binders between external inputs and use-cases.

Adapters:

- receive external requests (HTTP, CLI, etc.),
- resolve concrete implementations of ports,
- inject them into use-cases.

Adapters must not:

- redefine port contracts,
- bypass ports to call infrastructure directly.

Example adapter locations:

adapters/ ├─ queries/ │ ├─ Services.ts │ └─ QueriesRouter.ts └─ commands/ ├─
Services.ts └─ CommandsRouter.ts

## Testing Strategy

- Ports are a primary enabler of testability.
- Use-cases test against mocked or fake ports.
- Infrastructure implementations are tested separately.
- Port interfaces themselves are not tested directly.

This allows:

- fast, isolated use-case tests,
- independent validation of infrastructure behavior.

See:

ADR-006 – Use cases tests ADR-007 – Domain tests

## What Ports Must Not Do

Ports must not:

- contain business logic,
- reference adapters or infra code,
- depend on framework types,
- encode transport or persistence details.

If a port starts to feel “smart”, it is likely doing too much.

## Summary

Ports:

- define the application’s external needs,
- enforce dependency inversion,
- decouple use-cases from infrastructure,
- enable isolated testing and architectural enforcement.
