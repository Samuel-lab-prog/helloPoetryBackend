# AGENTS

Quick guide for collaborating on the OlaPoesia backend. This file summarizes how
to run, test, and follow the project's architecture rules.

## Where You Are

- Repo: OlaPoesia backend
- Runtime: Bun
- HTTP framework: Elysia
- ORM: Prisma

## Quick Setup

1. Install dependencies:
   - `bun install`
2. Configure the environment:
   - Adjust `.env` to your database, JWT, etc.
3. Generate Prisma client:
   - `bun run generate`
4. Run migrations (dev):
   - `bun run migratedev`
5. Start the server:
   - `bun run dev`

## Key Scripts (package.json)

- `bun run dev` starts the dev server
- `bun run build` generates `dist/`
- `bun run start` runs `dist/` in production
- `bun run test:all` runs the full suite
- `bun run test:unit` runs use-case and policy tests
- `bun run test:integration` runs integration tests
- `bun run test:e2e` runs e2e with Playwright
- `bun run lint` and `bun run format` checks
- `bun run typecheck` TS type check
- `bun run metrics` collects metrics
- `bun run depcruise` checks dependency rules
- `bun run check` full local gate

## Architecture In 1 Minute

- Domain-oriented architecture.
- Mandatory dependency direction: `adapters -> use-cases -> ports <- infra`
- CQRS: commands and queries separated.
- Ports define contracts, infra implements, adapters do wiring.
- Architecture rules are measured and block CI on violations.

## Where To Put New Code

- Use-cases: `src/domains/<domain>/use-cases/`
  - `commands/` and `queries/`
  - Each use-case has `execute.ts` and `execute.test.ts`
- Ports: `src/domains/<domain>/ports/`
- Adapters: `src/domains/<domain>/adapters/`
- Infra: `src/domains/<domain>/infra/`
- Shared kernel: `src/shared-kernel/`
- Generic subdomains: `src/generic-subdomains/`

## Testing Rules

- Use-cases: tests required.
- Infra: tests encouraged.
- Adapters: tests optional.
- Unit tests live next to the module under test.

## Conventions

- Errors centralized in `@GenericSubdomains/utils`: `domainError.ts` and
  `AppError.ts`
- One use-case per file, one factory per use-case.
- Do not import Prisma outside `infra/`.
- Do not import adapters inside use-cases.

## Common Tasks

- Create a new use-case:
  - Add `execute.ts` and `execute.test.ts` under
    `src/domains/<domain>/use-cases/commands/<use-case>/` or
    `src/domains/<domain>/use-cases/queries/<use-case>/`
  - Export the input params type from `execute.ts`
  - Keep business rules inside the use-case, not in adapters
- Add a new port:
  - Define the interface in `src/domains/<domain>/ports/Commands.ts` or
    `src/domains/<domain>/ports/Queries.ts`
  - Use app-owned models from `ports/Models.ts`
- Implement infra for a port:
  - Create a repository in `src/domains/<domain>/infra/`
  - Implement the port interface exactly
  - Map DB results to app models explicitly
- Add an HTTP route:
  - Update `src/domains/<domain>/adapters/CommandsRouter.ts` or
    `src/domains/<domain>/adapters/QueriesRouter.ts`
  - Validate input, wire dependencies, call the use-case
  - Map errors to HTTP responses
- Add a domain model:
  - Define or adjust types in `ports/Models.ts`
  - Keep models framework-agnostic

## Docs

- README: `README.md`
- Architecture docs: `architecture-analysis/docs/*.md`
- ADRs: `architecture-analysis/adrs/READEME.md`
