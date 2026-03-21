# OlaPoesia Backend

Backend for the **OlaPoesia** poetry social network. This repository implements
the API and business rules using **DDD**, **CQRS**, and a **domain-oriented
architecture**, focused on isolation, testability, and long-term evolution.

Main technologies:

- **TypeScript**
- **Bun** (runtime and test runner)
- **Elysia** (HTTP framework)
- **Prisma** (ORM)

---

## Architecture in 1 Minute

- **Modular monolith by domains**: each domain is cohesive and mostly
  independent.
- **Dependency direction**: `adapters -> use-cases -> domains`.
- **Ports & Adapters**: contracts (ports) live in the core; implementations stay
  at the edge.
- **CQRS**: explicit separation between commands (write) and queries (read).
- **Dependency injection**: performed in adapters/composition roots.
- **Architectural rules are mandatory**: CI measures and blocks violations.

For the full rationale, see the docs and ADRs below.

---

## Architecture Documentation

Practical guides (how to work within the decisions):

- [Architecture overview](architecture-analysis/docs/001-architecture.md)
- [Use-cases](architecture-analysis/docs/002-use-cases.md)
- [Ports](architecture-analysis/docs/003-ports.md)
- [Adapters](architecture-analysis/docs/004-adapters.md)
- [Infra](architecture-analysis/docs/005-infra.md)
- [Dependency injection](architecture-analysis/docs/006-injection.md)
- [Tests](architecture-analysis/docs/007-tests.md)

ADRs (decisions, rules, and enforcement):

- [ADR index](architecture-analysis/adrs/READEME.md)

---

## Project Structure (summary)

```text
src/
  domains/                 # Core domains (poems, users, interactions...)
  generic-subdomains/      # Generic subdomains (auth, persistence, utils)
  shared-kernel/           # Shared types, ports, and utilities
  tests/                   # Integration/E2E and helpers
  Server.ts                # Server entry point
```

Each domain follows the same internal organization:

- `use-cases/` (commands and queries)
- `ports/` (input/output interfaces)
- `adapters/` (HTTP and composition)
- `infra/` (repositories and integrations)

---

## Running Locally

### Prerequisites

- **Bun** installed
- **Node.js** (for Prisma CLI)
- **PostgreSQL** local or via Docker

### Step by step

1. Install dependencies:

```bash
bun install
```

2. Configure the environment:

Adjust `.env` to match your setup (database, JWT, etc.).

3. Generate Prisma client:

```bash
bun run generate
```

4. Run migrations (dev):

```bash
bun run migratedev
```

5. Start the server:

```bash
bun run dev
```

---

## Tests

- Full test suite:

```bash
bun run test:all
```

- Use-case tests (unit):

```bash
bun run test:unit
```

- Integration tests:

```bash
bun run test:integration
```

---

## Quality & Metrics

Useful commands:

```bash
bun run lint
bun run format
bun run typecheck
bun run metrics
bun run depcruise
```

All-in-one (local CI gate):

```bash
bun run check
```

---

## Docker

Simple build and run:

```bash
bun run docker:up
```

Or via compose:

```bash
bun run compose
```

---

## Commit Conventions

We follow **Conventional Commits**:

- `feat:` new feature
- `fix:` bug fix
- `refactor:` refactor without behavior change
- `docs:` documentation
- `style:` formatting
- `test:` tests
- `chore:` maintenance tasks

Example:

```
fix: handle expired token login
```

---

## Related Links

- Frontend:
  [helloPoetry Frontend Repository](https://github.com/Samuel-lab-prog/helloPoetryFrontend)

---

## Contributing

Suggestions and PRs are welcome. Before opening a PR, run `bun run check` to
ensure architectural compliance.
