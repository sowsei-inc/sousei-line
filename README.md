# Sousei-line

**Sousei-line starts from three practical facts about Sowsei Inc.: we are currently a one-person company, the person responsible for adopting software is not a software engineer, and Sowsei is not a software company.**

AI made software implementation accessible to us. It did not answer the harder question:

> If the human responsible for shipping a product cannot reliably inspect the code itself, what evidence should exist before the company adopts that exact revision?

Sousei-line is the software production and verification system we built around that constraint.

We use AI and automation to implement software, then separate implementation from deterministic checks, requirements review, independent verification, and the final human adoption decision. The goal is not to prove that software is perfect. The goal is to make it explicit **what exact revision was inspected, what evidence exists for it, what remains uncertain, and what the human actually decided to adopt.**

## The line

```text
Implementation
  → Pull Request
  → CI
  → Requirements Review
  → Independent Verification
  → Human ADOPT / REJECT
  → Merge
  → Deploy
  → Production Verification
```

The full Git commit SHA of the current pull-request head identifies the inspection subject. If the head changes, it is a new subject and prior review evidence does not automatically transfer.

Requirements Review and Independent Verification are deliberately separate roles. Independent Verification retrieves the applicable change and source material itself and must not use the earlier semantic verdict as grounds for its own conclusion.

AI reviewers may produce evidence and verdicts. They do not make the company's final adoption decision. **Human ADOPT / REJECT remains a human decision for an exact revision.**

## Why publish the factory?

Sowsei builds things; software is one capability we use when it is useful to what we want to make.

This repository is a public view of the software factory behind that work: the process, the boundaries between roles, the evidence format, and the executable machinery we currently use to test the approach.

It is not presented as a universal standard, a guarantee of correctness, or a claim that this is the only way to build software with AI. It is simply how we are approaching a practical problem inside our company, with the implementation and known limitations left visible for anyone who wants to inspect them.

## What to inspect

- [Trust model](docs/TRUST_MODEL.md) — why adoption is separated from code approval and AI verdicts.
- [Change identity](docs/IDENTITY.md) — why evidence is bound to the full PR head SHA.
- [Production contract](docs/PRODUCTION_CONTRACT.md) — stage boundaries and authority.
- [Current limits](docs/LIMITS.md) — what PASS, ADOPT, deployment, and verification do **not** prove.
- [Review handoff](docs/REVIEW_HANDOFF.md) and [evidence format](docs/REVIEW_EVIDENCE.md) — how review evidence moves through the line.
- [CI workflow](.github/workflows/ci.yml) and [Requirements Review runner](.github/scripts/run-requirements-review.sh) — the current executable machinery.

## Status

Sousei-line is in active use and still evolving.

The current public line intentionally leaves some hardening unfinished, including mechanical enforcement of Human ADOPT at every GitHub boundary, provider-family-separated AI review, and stronger build / served-artifact provenance. Those limits are documented rather than hidden.

Do not infer guarantees beyond the evidence and limitations documented in this repository.
