import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const required = [
  "docs/TRUST_MODEL.md",
  "docs/LIMITS.md",
  "docs/IDENTITY.md",
  "docs/PRODUCTION_CONTRACT.md"
];

test("public trust contracts exist and retain core boundaries", async () => {
  const texts = await Promise.all(required.map((path) => readFile(path, "utf8")));
  assert.match(texts[0], /human does not approve the code/i);
  assert.match(texts[0], /full Git commit SHA/i);
  assert.match(texts[1], /provider-family independence is not guaranteed/i);
  assert.match(texts[1], /does not prove served-byte provenance/i);
  assert.match(texts[2], /sousei\.line-evidence\/v1/);
  assert.match(texts[3], /Human ADOPT\/REJECT/);
});
