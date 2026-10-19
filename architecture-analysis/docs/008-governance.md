# Architecture Governance

This guide describes the backend checks that are actually run by
`bun run check:architecture`. It complements the layer and domain descriptions
in `001-architecture.md`; metric values are signals and do not independently
fail the architecture check.

## Layer ownership and dependency direction

The current source layout uses `domains/` and `generic-subdomains/`, with
`shared-kernel/` and `server-config/` as shared/runtime areas. Within a domain,
the analyzer recognizes `adapters/`, `use-cases/`, `ports/`, `infra/`, and
`domain/` or `entities/` as layers.

The enforced dependency matrix is:

| Importing layer       | Allowed recognized target layers           |
| --------------------- | ------------------------------------------ |
| `adapters`            | `adapters`, `use-cases`, `ports`, `domain` |
| `use-cases`           | `use-cases`, `ports`, `domain`             |
| `ports`               | `ports`, `domain`                          |
| `infra`               | `infra`, `ports`, `domain`                 |
| `domain` / `entities` | `domain` / `entities`                      |

The analyzer ignores paths outside these recognized layers for this rule. Other
rules check domain boundaries and use-case conventions. Keep cross-domain access
behind the domain's existing public entry point (`public/Index.ts`) and do not
import another domain's internal implementation.

## Contracts, names, and imports

Existing architecture rules verify the source conventions represented by the
current project: domain and subdomain structure, public cross-domain calls,
case-sensitive import resolution, ports and infrastructure placement, repository
naming, use-case folder/factory/error-import conventions, required barrels, and
use-case tests. Consult the corresponding ADRs and rule tests before changing
any convention. The checker does not define a universal `app`, `core`, or
`contracts` hierarchy; those are not required by this repository's current
structure.

Dependency-cruiser separately checks unresolved and undeclared dependencies,
circular dependencies, production-to-development dependency edges, and other
configured dependency rules. Its configured severities remain authoritative:
errors fail its command, while the current warning remains visible but
non-blocking.

## Running the checks

- `bun run test:architecture` runs architecture rule and governance unit tests.
- `bun run check:architecture` creates fresh cloc and dependency-cruiser reports
  in a temporary directory, checks that the reports are complete and nonempty,
  runs all custom architecture rules, and removes the temporary reports.
- `bun run depcruise` runs dependency-cruiser directly and preserves its
  configured exit behavior.
- `bun run metrics` writes `cloc.json` and `depcruise.json` into the repository
  for local exploration; it is not part of the non-mutating static gate.

The architecture gate fails on unrecorded custom-rule findings, stale legacy
entries, incomplete/empty analysis inputs, or dependency-cruiser errors. It
prints the exact legacy findings separately. Metrics such as fan-in, isolation,
and size are informational until a dedicated blocking rule and test exist.

## Legacy exceptions

Only exact finding objects identified by both `ruleId` and their complete
finding data may be temporarily accepted. Each entry in
`src/governance/legacy-findings.json` includes a reason and a specific cleanup
direction. A nearby or new finding is still blocking. Once a recorded finding
disappears, the stale entry fails the check and should be removed. Do not add
wildcards, broad file/path exemptions, or downgrade rule severity to suppress a
failure. Changes to policy require an ADR, corresponding rule tests, and an
updated explanation here.

The legacy register currently has no accepted findings. Add an entry only for
a\r\nverified preexisting finding with a precise cleanup direction, and remove
it as\r\nsoon as the finding is eliminated.\r\n\r\nThe rate-limit plugin is
installed by the root application as a reusable Elysia\r\nplugin. Its request
and error lifecycle hooks use global scope so parent routes\r\nreceive the
policy. The plugin tests set skip explicitly to false because the\r\nproduction
settings intentionally skip requests when NODE_ENV=test.\r\n\r\n## Adding a
domain or use case

Follow the repository's existing domain and use-case guides and ADRs. Add
cross-domain dependencies through the target domain's public entry point. Keep
use cases independent of adapters and infrastructure, express external
dependencies through ports, and add focused rule tests when a new convention is
introduced. Run `bun run test:architecture` and `bun run check:architecture`.
The latter does not generate Prisma clients, barrels, run migrations, seed data,
or access the database.
