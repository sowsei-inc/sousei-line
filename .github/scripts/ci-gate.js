import fs from "node:fs";

export const MARKER_PREFIX = "<!-- CI_GATE_MARKER:";
export const MARKER_SUFFIX = "-->";
export const GATE_USER_LOGIN = "sousei-yamashita";
export const GATE_APP_SLUG = "sousei-approval-test";

export function parseMarkerPayload(body) {
  if (typeof body !== "string") return null;
  const start = body.indexOf(MARKER_PREFIX);
  if (start < 0) return null;
  const end = body.indexOf(MARKER_SUFFIX, start);
  if (end < 0) return null;
  try {
    return JSON.parse(body.slice(start + MARKER_PREFIX.length, end).trim());
  } catch {
    return null;
  }
}

export function isTrustedGateComment(comment) {
  return Boolean(
    comment?.user?.login === GATE_USER_LOGIN &&
    comment?.user?.type === "User" &&
    comment?.performed_via_github_app?.slug === GATE_APP_SLUG
  );
}

export function isCurrentReviewablePullRequest(pr, headSha) {
  return Boolean(
    pr?.state === "open" &&
    pr?.draft === false &&
    pr?.head?.sha === headSha
  );
}

export function buildCommentBody({ prNumber, headSha, runId, runAttempt, workflowName, conclusion, runUrl, createdAt }) {
  const payload = {
    prNumber,
    headSha,
    runId,
    runAttempt,
    workflowName,
    conclusion,
    createdAt,
  };
  return `${MARKER_PREFIX} ${JSON.stringify(payload)} ${MARKER_SUFFIX}
## Sousei-line CI Gate: ${conclusion === "success" ? "READY" : "NOT READY"}

- **Workflow**: ${workflowName}
- **PR**: #${prNumber}
- **Full head SHA**: \`${headSha}\`
- **Run**: [${runId}](${runUrl}) (attempt ${runAttempt})
- **Conclusion**: **${conclusion}**

This comment is an evidence pointer for downstream Independent Verification. GitHub remains the source of truth; downstream verification must re-fetch the PR, exact head SHA, CI, and Requirements Review state independently.`;
}

async function fetchAllComments(apiFetch, owner, repo, prNumber) {
  const out = [];
  for (let page = 1; ; page += 1) {
    const rows = await apiFetch(`/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100&page=${page}`);
    if (!Array.isArray(rows)) throw new Error("Unexpected comments API response");
    out.push(...rows);
    if (rows.length < 100) return out;
  }
}

export async function runCiGate({ env = process.env, apiFetch: injectedApi = null } = {}) {
  const { GITHUB_EVENT_PATH, GITHUB_REPOSITORY, SOUSEI_WORK_USER_TOKEN } = env;
  if (!GITHUB_EVENT_PATH || !GITHUB_REPOSITORY || !SOUSEI_WORK_USER_TOKEN) {
    throw new Error("Missing GITHUB_EVENT_PATH, GITHUB_REPOSITORY, or SOUSEI_WORK_USER_TOKEN");
  }

  const payload = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, "utf8"));
  const run = payload.workflow_run;
  if (!run || run.name !== "CI" || run.event !== "pull_request" || run.status !== "completed") return;
  if (run.conclusion !== "success") return;

  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  const apiFetch = injectedApi || (async (endpoint, options = {}) => {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${SOUSEI_WORK_USER_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
    return response.json();
  });

  const headSha = run.head_sha;
  let prNumbers = Array.isArray(run.pull_requests)
    ? run.pull_requests.map((pr) => pr.number).filter(Number.isInteger)
    : [];

  if (prNumbers.length === 0) {
    const prs = await apiFetch(`/repos/${owner}/${repo}/commits/${headSha}/pulls`);
    if (!Array.isArray(prs)) throw new Error("Unexpected commit-to-PR response");
    prNumbers = prs.map((pr) => pr.number).filter(Number.isInteger);
  }

  for (const prNumber of [...new Set(prNumbers)]) {
    const pr = await apiFetch(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    if (!isCurrentReviewablePullRequest(pr, headSha)) continue;

    const comments = await fetchAllComments(apiFetch, owner, repo, prNumber);
    const duplicate = comments
      .filter(isTrustedGateComment)
      .map((comment) => parseMarkerPayload(comment.body))
      .some((marker) =>
        marker &&
        marker.prNumber === prNumber &&
        marker.headSha === headSha &&
        String(marker.runId) === String(run.id) &&
        Number(marker.runAttempt || 1) === Number(run.run_attempt || 1)
      );
    if (duplicate) continue;

    const body = buildCommentBody({
      prNumber,
      headSha,
      runId: run.id,
      runAttempt: run.run_attempt || 1,
      workflowName: run.name,
      conclusion: run.conclusion,
      runUrl: run.html_url,
      createdAt: new Date().toISOString(),
    });

    await apiFetch(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }
}

if (process.argv[1]?.endsWith("ci-gate.js")) {
  runCiGate().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
