# Change identity

## Principle

A pull request number is not a change identity. The inspected change is identified by the **full Git commit SHA of the PR head**.

A later PR update creates a different inspection subject. Evidence for an earlier head does not automatically apply to the new head.

## Minimum identity chain

1. PR candidate — `repository + pr_number + full head_sha`
2. CI evidence — run identity and conclusion tied to that head
3. Requirements Review — result tied to that head
4. Independent Verification — result tied to that head
5. Human ADOPT/REJECT — explicit decision for that head
6. Merge — record the merge commit separately
7. Deployment — record the deployment event and reported revision
8. Production Verification — record what was actually observed

## Evidence envelope

Where machine-readable evidence is emitted, the base envelope is:

```json
{
  "schema": "sousei.line-evidence/v1",
  "repository": "owner/repository",
  "pr_number": 0,
  "subject_head_sha": "40-character full SHA",
  "stage": "ci | semantic | independent | adoption | deploy | production",
  "verdict": "PASS | NG | ADOPT | REJECT | SUCCESS | FAILURE",
  "evidence": {},
  "issued_at": "RFC3339 timestamp"
}
```

Stage-specific evidence belongs inside `evidence`.

## Merge boundary

The merge boundary is an identity transition:

`adopted PR head_sha → merge_commit_sha → deployment-reported revision → production observation`

These values are related, but must not be treated as equal unless a mechanism actually proves the transition.
