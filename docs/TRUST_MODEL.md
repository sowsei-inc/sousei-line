# Sousei-line Trust Model

## Problem

AI can implement software faster than a non-specialist product owner can inspect the code. Sousei-line does not solve that problem by asking one AI whether another AI's work is "good." It creates a chain of bounded evidence around an exact change and leaves the final adoption decision with a human.

## Core rule

**The human does not approve the code. The human decides whether the company adopts an exact revision, using the available production evidence and known limits.**

Every pre-merge review result is bound to the full Git commit SHA of the current pull-request head. A PR number alone is not a sufficient identity.

## Production sequence

`Implementation → Pull Request → CI → Requirements Review → Independent Verification → Human ADOPT/REJECT → Merge → Deploy → Production Verification`

### Deterministic CI

CI checks machine-verifiable conditions against the exact candidate revision. A green CI run is necessary evidence where required; it is not proof that the intended product was built.

### Requirements Review

Requirements Review compares the exact candidate with the applicable request, requirements, design, QA, and implementation material. Its result is evidence, not adoption authority.

### Independent Verification

Independent Verification is a separate role. Before semantic inspection it independently checks the exact current subject identity and required upstream stage completion. It retrieves the applicable diff and source material itself and must not inherit prior semantic verdicts as grounds for its own verdict.

Independence here means separation of role, context, evidence retrieval, authority, and execution path. It does **not** currently mean provider-family independence.

### Human ADOPT / REJECT

ADOPT means:

> Given the production evidence and known limitations for this exact full SHA, the company decides to adopt this revision.

ADOPT is **not** a claim that the human read or approved the code, that the software is defect-free, or that every risk has been eliminated.

A changed revision is a new subject. Prior review or adoption evidence does not automatically transfer.

### Production Verification

Production Verification checks the deployed system for explicitly configured observable conditions and records the deployment-reported revision. Its proof is limited to what the verification actually measured.

## What this model is trying to achieve

Sousei-line is designed to make the adoption decision inspectable:

- Which exact revision was inspected?
- Which deterministic checks passed?
- Which requirements were reviewed?
- Was an independent review performed without inheriting the earlier semantic conclusion?
- What did the human actually decide?
- What was deployed?
- What was actually verified in production?

The model favors explicit evidence and bounded claims over a single broad statement that the software is "safe" or "correct."
