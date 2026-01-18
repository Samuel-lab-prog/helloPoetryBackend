# ADR-001: Domain-based structure

## Status

Accepted

## Context

The codebase is organized around business domains (e.g. users-management,
authentication, poems-management) instead of technical layers.

This structure aims to reduce coupling, improve change locality, and make
architectural boundaries explicit.

## Decision

- All source code must belong to a domain or a generic subdomain.
- Cross-domain dependencies are allowed only through explicit ports.
- Generic subdomains (e.g. utils, persistence) must not depend on business
  domains.

## Consequences

- Some duplication across domains may occur.
- Domain boundaries are easier to reason about and measure.
- Enables architectural metrics such as domain isolation and size.
