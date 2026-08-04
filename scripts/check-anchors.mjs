#!/usr/bin/env node
/**
 * Fails if any in-page anchor (href="#foo") has no matching id="foo".
 *
 * Exists because 5 of 7 nav links shipped broken — every link in the site
 * header pointed at an id that was never rendered. A grep-level check is
 * enough to make that class of bug impossible to reintroduce silently.
 *
 * Usage: node scripts/check-anchors.mjs [url]
 */
const url = process.argv[2] ?? "http://localhost:3000";

// Anchors that are valid without a matching id.
const ALLOWED = new Set(["top", ""]);

let html;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${url} returned HTTP ${res.status}`);
    process.exit(1);
  }
  html = await res.text();
} catch (err) {
  console.error(`✗ could not reach ${url} — is the dev server running?`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...html.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);

const dead = [...new Set(anchors)].filter((a) => !ALLOWED.has(a) && !ids.has(a));

if (dead.length > 0) {
  console.error(`✗ ${dead.length} dead anchor(s) — link goes nowhere:`);
  for (const d of dead) console.error(`    href="#${d}"  (no id="${d}" in DOM)`);
  process.exit(1);
}

console.log(`✓ all ${new Set(anchors).size} in-page anchors resolve (${ids.size} ids found)`);
