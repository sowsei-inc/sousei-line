# Review handoff contract

## Entry condition

Requirements Review may start only after deterministic CI succeeds for the exact current PR head. The review subject is:

`repository + pr_number + full subject_head_sha`

Before semantic review starts, the current PR head must still equal the fixed subject SHA. If it changes, stop.

## Inputs

The reviewer receives the PR request/body, exact diff, and all applicable repository requirements and trust contracts. Missing optional product-specific documents are not by themselves an NG.

## Output

The result is machine-readable `sousei.line-evidence/v1` evidence bound to the same full SHA. It is evidence for later Independent Verification and Human ADOPT/REJECT; it is not adoption, merge approval, release approval, or deployment authorization.

## Executor

The review role is provider-independent as a contract even when a current implementation uses a particular executor. The executor must not modify the inspected revision or make the human adoption decision.
