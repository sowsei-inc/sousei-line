import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MARKER_PREFIX,
  GATE_USER_LOGIN,
  GATE_APP_SLUG,
  buildCommentBody,
  parseMarkerPayload,
  isTrustedGateComment,
  isCurrentReviewablePullRequest,
} from "../.github/scripts/ci-gate.js";

test("gate marker round-trips exact identity", () => {
  const body = buildCommentBody({
    prNumber: 2,
    headSha: "a".repeat(40),
    runId: 123,
    runAttempt: 2,
    workflowName: "CI",
    conclusion: "success",
    runUrl: "https://example.invalid/run/123",
    createdAt: "2026-09-21T00:00:00Z",
  });
  assert.ok(body.startsWith(MARKER_PREFIX));
  assert.deepEqual(parseMarkerPayload(body), {
    prNumber: 2,
    headSha: "a".repeat(40),
    runId: 123,
    runAttempt: 2,
    workflowName: "CI",
    conclusion: "success",
    createdAt: "2026-09-21T00:00:00Z",
  });
});

test("trusted gate identity requires user plus dedicated app attribution", () => {
  assert.equal(isTrustedGateComment({
    user: { login: GATE_USER_LOGIN, type: "User" },
    performed_via_github_app: { slug: GATE_APP_SLUG },
  }), true);
  assert.equal(isTrustedGateComment({
    user: { login: GATE_USER_LOGIN, type: "User" },
  }), false);
  assert.equal(isTrustedGateComment({
    user: { login: "github-actions[bot]", type: "Bot" },
    performed_via_github_app: { slug: GATE_APP_SLUG },
  }), false);
});

test("only current open non-draft exact head is eligible", () => {
  const sha = "b".repeat(40);
  assert.equal(isCurrentReviewablePullRequest({ state: "open", draft: false, head: { sha } }, sha), true);
  assert.equal(isCurrentReviewablePullRequest({ state: "open", draft: false, head: { sha: "c".repeat(40) } }, sha), false);
  assert.equal(isCurrentReviewablePullRequest({ state: "closed", draft: false, head: { sha } }, sha), false);
  assert.equal(isCurrentReviewablePullRequest({ state: "open", draft: true, head: { sha } }, sha), false);
});

test("workflow is post-CI, success-only, and does not run untrusted PR code", () => {
  const workflow = fs.readFileSync(".github/workflows/ci-gate.yml", "utf8");
  assert.ok(workflow.includes("workflow_run:"));
  assert.ok(workflow.includes('workflows: ["CI"]'));
  assert.ok(workflow.includes("types: [completed]"));
  assert.ok(workflow.includes("workflow_run.conclusion == 'success'"));
  assert.ok(workflow.includes("actions/checkout@v4"));
  assert.equal(workflow.includes("ref: ${{ github.event.workflow_run.head_sha }}"), false);
  assert.ok(workflow.includes("SOUSEI_WORK_USER_TOKEN"));
});
