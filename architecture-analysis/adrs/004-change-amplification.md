# ADR-004: Change amplification thresholds

## Status

Accepted

## Context

Change amplification measures how many files are affected by a single change.
High amplification correlates with fear of change and low modularity.

Analysis of recent commits showed clear patterns per domain.

## Decision

Change amplification is classified using two signals:

Average files per commit:

- OK: ≤ 5
- WARN: 6–10
- FAIL: > 10

Maximum files in a single commit:

- OK: ≤ 20
- WARN: 21–30
- FAIL: > 30

If either signal is FAIL, the domain is classified as FAIL.

## Consequences

- Encourages smaller, more focused changes.
- Highlights domains that require architectural attention.
- May flag core domains more often and requires contextual interpretation.
