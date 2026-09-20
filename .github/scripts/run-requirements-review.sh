#!/usr/bin/env bash
set -euo pipefail

mkdir -p .sousei-review

current="$(gh api "repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER")"
test "$(jq -r '.state' <<<"$current")" = "open"
test "$(jq -r '.draft' <<<"$current")" = "false"
test "$(jq -r '.head.sha' <<<"$current")" = "$SUBJECT_SHA"

gh api "repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER" > .sousei-review/pr.json
gh api "repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/files?per_page=100" --paginate > .sousei-review/files.json
git diff --no-ext-diff "$BASE_SHA...$SUBJECT_SHA" > .sousei-review/diff.patch
cat > .sousei-review/context.txt <<EOF
repository=$GITHUB_REPOSITORY
pr_number=$PR_NUMBER
subject_head_sha=$SUBJECT_SHA
ci_run_id=$GITHUB_RUN_ID
ci_run_attempt=$GITHUB_RUN_ATTEMPT
ci_conclusion=success
EOF

cat > .sousei-review/prompt.txt <<'EOF'
You are the Requirements Review executor for Sousei-line.
Inspection only: do not modify files, merge, deploy, approve, request changes,
or make the human adoption decision.

Read .sousei-review/context.txt, pr.json, files.json, diff.patch,
docs/TRUST_MODEL.md, docs/LIMITS.md, docs/IDENTITY.md,
docs/PRODUCTION_CONTRACT.md, docs/REVIEW_HANDOFF.md,
docs/REVIEW_EVIDENCE.md, README.md, and any other applicable repository
requirements or product/design/QA/implementation instructions that are present.
Compare the exact PR request and exact diff with all applicable requirements.

Return ONLY one JSON object, no Markdown:
{"schema":"sousei.line-evidence/v1","repository":"<context>","pr_number":0,
"subject_head_sha":"<context>","stage":"semantic","verdict":"PASS or NG",
"evidence":{"review_request_schema":"sousei.review-request/v1","ci_run_id":0,
"ci_run_attempt":0,"ci_conclusion":"success","findings":[]},
"inspector":{"process":"requirements-conformance-review","process_version":"1",
"executor":"github-copilot-cli","model":"gpt-5.3-codex"},
"issued_at":"<RFC3339 UTC>"}
For NG, findings must identify concrete mismatches and their source requirement.
EOF

copilot -sp "$(cat .sousei-review/prompt.txt)" --no-ask-user > .sousei-review/evidence.raw.json
python3 - <<'PY'
import json
from pathlib import Path
raw = Path(".sousei-review/evidence.raw.json").read_text()
start, end = raw.find("{"), raw.rfind("}")
if start < 0 or end < start:
    raise SystemExit("Requirements Review returned no JSON object")
obj = json.loads(raw[start:end + 1])
Path(".sousei-review/evidence.json").write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
PY

current="$(gh api "repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER")"
test "$(jq -r '.state' <<<"$current")" = "open"
test "$(jq -r '.draft' <<<"$current")" = "false"
test "$(jq -r '.head.sha' <<<"$current")" = "$SUBJECT_SHA"

jq -e --arg repo "$GITHUB_REPOSITORY" --arg sha "$SUBJECT_SHA"   --argjson pr "$PR_NUMBER" --argjson run "$GITHUB_RUN_ID"   --argjson attempt "$GITHUB_RUN_ATTEMPT" '
  .schema == "sousei.line-evidence/v1" and
  .repository == $repo and .pr_number == $pr and .subject_head_sha == $sha and
  .stage == "semantic" and (.verdict == "PASS" or .verdict == "NG") and
  .evidence.review_request_schema == "sousei.review-request/v1" and
  .evidence.ci_run_id == $run and .evidence.ci_run_attempt == $attempt and
  .evidence.ci_conclusion == "success" and (.evidence.findings | type == "array") and
  .inspector.process == "requirements-conformance-review" and
  .inspector.process_version == "1"
' .sousei-review/evidence.json
cat .sousei-review/evidence.json >> "$GITHUB_STEP_SUMMARY"
