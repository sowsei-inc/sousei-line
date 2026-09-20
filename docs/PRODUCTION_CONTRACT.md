# Production contract

## Purpose

Sousei-line turns a proposed software change into a set of reviewable production evidence while preserving a human adoption boundary.

## Sequence

`Implementation → Pull Request → CI → Requirements Review → Independent Verification → Human ADOPT/REJECT → Merge → Deploy → Production Verification`

## Stage boundaries

### Implementation

An implementation executor may create or modify the candidate change. Its own claims about correctness are not review evidence.

### Pull Request

The PR exposes the candidate for inspection. The full current head SHA is fixed as the review subject.

### CI

Deterministic checks run against the exact candidate revision.

### Requirements Review

After required CI succeeds, a semantic reviewer compares the exact revision with the PR request and applicable requirements/design/QA/implementation sources. It may report PASS/NG evidence but may not make the human adoption decision.

### Independent Verification

A separate read-only verifier first checks the entrance gate for the same exact head, then independently retrieves and inspects the change. It must not use the earlier semantic verdict as grounds for its own conclusion.

Operational outcomes may include `PASS`, `NG`, `STALE`, `EQUIPMENT STOP`, and `UNKNOWN`.

### Human ADOPT/REJECT

Only the human authority decides whether the company adopts the exact reviewed revision. This decision is distinct from code review and from AI verdicts.

### Merge and deploy

Only an explicitly adopted revision should proceed. Review executors do not receive merge or deploy authority.

### Production Verification

Post-deployment checks verify configured observable production conditions. Claims must remain within the evidence actually collected.

## Staleness

Any stage that depends on a PR candidate must fail closed when the current full head SHA no longer matches the fixed subject. A new head requires new evidence.

## Executor replaceability

The contract describes roles and evidence, not a permanent AI vendor. AI executors should be replaceable without changing the trust semantics of the line.
