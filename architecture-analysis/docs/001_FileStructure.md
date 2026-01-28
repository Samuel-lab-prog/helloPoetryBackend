# 001_file-structure.md

This document describes the folder and file organization of the project and the
responsibility of each layer.

The architecture follows Clean Architecture / Hexagonal Architecture principles,
separating:

- Delivery layer (HTTP)
- Use cases
- Ports (contracts)
- Infrastructure

---

adapters/ ├─ http/ │ ├─ queries/ │ │ ├─ Services.ts │ │ ├─ QueriesRouter.ts │ │
└─ QueriesRouter.test.ts │ │ │ ├─ commands/ │ │ ├─ Services.ts │ │ ├─
CommandsRouter.ts │ │ └─ CommandsRouter.test.ts │ │ │ └─ schemas/ │ └─ Index.ts
│ infra/ ├─ queries-repository/ │ ├─ Repository.ts │ └─ Repository.test.ts │ └─
commands-repository/ ├─ Repository.ts └─ Repository.test.ts │ use-cases/ ├─
queries/ │ ├─ Errors.ts │ ├─ Index.ts │ └─ models/ │ └─ Index.ts │ └─ commands/
├─ Errors.ts ├─ Index.ts └─ models/ └─ Index.ts │ ports/ ├─ QueriesRepository.ts
└─ CommandsRepository.ts

## 📁 adapters/http

Layer responsible for exposing use cases through HTTP.

Contains **no business logic**.

---

### adapters/http/queries

adapters/http/queries/ ├─ Services.ts ├─ QueriesRouter.ts └─
QueriesRouter.test.ts

**Services.ts**

Creates and wires query use cases into callable service functions.

Acts as the composition root for query-side HTTP handlers.

**QueriesRouter.ts**

Defines HTTP routes for query operations.

Responsibilities:

- Receive HTTP requests
- Extract params / query / auth context
- Call services
- Return response

No business rules allowed.

**QueriesRouter.test.ts**

Integration tests for the query HTTP router.

Validates:

- Routes existence
- Parameter forwarding
- Integration with services

---

### adapters/http/commands

**QueriesRouter.ts**

Defines HTTP routes for query operations.

Responsibilities:

- Receive HTTP requests
- Extract params/query/auth context
- Call services
- Return response

No business rules allowed.

**QueriesRouter.test.ts**

Integration tests for the query HTTP router.

Validates:

- Routes existence
- Parameter forwarding
- Integration with services

---

### adapters/http/commands

adapters/http/commands/ ├─ Services.ts ├─ CommandsRouter.ts └─
CommandsRouter.test.ts

Same responsibilities as `queries`, but for command (write) operations.

Commands mutate state.

---

### adapters/schemas

Centralizes all HTTP schemas:

- Request validation
- Response validation
- Shared DTO schemas

Schemas are used only by adapters.

---

## 📁 infra

Infrastructure implementations.

Concrete technical details live here.

---

### infra/queries-repository

infra/queries-repository/ ├─ Repository.ts └─ Repository.test.ts

Implements read-side persistence access.

Responsible for:

- Fetching data from database
- Translating DB models to domain models

---

### infra/commands-repository

infra/commands-repository/ ├─ Repository.ts └─ Repository.test.ts

Implements write-side persistence access.

Responsible for:

- Persisting data
- Updating records
- Transactions

---

## 📁 use-cases

Application business rules.

Contains pure domain logic.

---

### use-cases/queries

use-cases/queries/ ├─ Errors.ts ├─ get-user └─ models/ └─ Index.ts

**Errors.ts**

Domain-level errors for query use cases.

**Index.ts**

BarrelFile for easier exports.

**models/**

Domain models used by queries.

---

### use-cases/commands

use-cases/commands/ ├─ Errors.ts ├─ update-user └─ models/ └─ Index.ts

### use-cases/commands

Same structure as queries, but for write operations.

---

## 📁 ports

ports/ ├─ QueriesRepository.ts └─ CommandsRepository.ts

Defines interfaces (contracts) used by use cases.

Use cases depend only on these interfaces.

Infrastructure implements them.

---

## 🔁 Dependency Flow

adapters/http ↓ use-cases ↓ ports ↑ infra

Dependencies always point inward.

---

## 🎯 Architectural Rules

- Adapters never import from infra
- Use cases never import from adapters
- Use cases depend only on ports
- Infra depends on ports

---

## ✅ Benefits

- Testable business logic
- Replaceable infrastructure
- Clear separation of responsibilities
- Easier maintenance and refactoring

---
