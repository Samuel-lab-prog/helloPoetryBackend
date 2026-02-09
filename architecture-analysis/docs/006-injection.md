# Injections

This document describes how **dependency injection** is performed in the
application and where object composition is allowed.

Injection is treated as an **infrastructure concern**, never as business logic.

---

## Purpose

The injection layer is responsible for:
- wiring concrete implementations to ports,
- assembling use-cases,
- exposing ready-to-use application services.

It is the **only place** where abstractions meet implementations.

---

## Position in the Architecture

Injection sits at the **edge of the system**, typically inside adapters.

Rules:
- use-cases never import infra,
- infra never imports use-cases,
- injections import both and connect them.

---

## Factory Wiring

Use-cases are created via factories.

Example pattern:
- import a repository implementation from `infra`,
- pass it to a use-case factory,
- export the resulting function.

This keeps use-cases:
- stateless,
- testable,
- framework-agnostic.

---

## Adapters as Composition Roots

Adapters (HTTP, CLI, messaging, etc.) act as **composition roots**.

They:
- build use-case instances,
- expose them as services,
- translate external input/output.

No other layer is allowed to perform injection.

---

## Stability Rules

Injection code:
- contains no business logic,
- contains no validation rules,
- contains no persistence logic.

Its only responsibility is **assembly**.

---

## Summary

Injection:
- wires dependencies explicitly,
- keeps use-cases pure,
- isolates infra details,
- makes architecture enforceable.

If code decides *what to do*, it is not injection.
If code decides *what to connect*, it is.
