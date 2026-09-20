# Requirements Review evidence

Requirements Review emits one JSON object using the common `sousei.line-evidence/v1` envelope.

For the current implementation:

- `stage` is `semantic`;
- `verdict` is `PASS` or `NG`;
- repository, PR number, and full subject head SHA must match the workflow context;
- CI run id, run attempt, and successful conclusion are recorded;
- findings is an array;
- inspector metadata identifies the review process and executor.

A successful workflow execution proves that the evidence object passed structural validation. It does not turn a semantic PASS into Human ADOPT.
