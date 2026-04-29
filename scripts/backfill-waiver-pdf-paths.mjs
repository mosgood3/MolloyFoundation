// One-off backfill: populate waivers_2026.pdf_path for signed waivers whose
// PDF was already uploaded to the "waivers" storage bucket but whose row was
// never updated (column was added after the upload code was deployed).
//
// Run modes:
//   node scripts/backfill-waiver-pdf-paths.mjs          # dry run, prints plan
//   node scripts/backfill-waiver-pdf-paths.mjs --apply  # writes pdf_path

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load .env.local manually so we don't need a dep
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const supabase = createClient(url, key);

// 1. List PDFs already in the bucket under 2026/
const { data: files, error: listErr } = await supabase.storage
  .from("waivers")
  .list("2026", { limit: 1000 });

if (listErr) {
  console.error("Storage list failed:", listErr.message);
  process.exit(1);
}

const fileTokens = new Set(
  (files ?? [])
    .map((f) => f.name)
    .filter((n) => n.endsWith(".pdf"))
    .map((n) => n.replace(/\.pdf$/, ""))
);
console.log(`Found ${fileTokens.size} PDF(s) in waivers/2026/`);

// 2. Pull signed waivers with NULL pdf_path
const { data: rows, error: rowErr } = await supabase
  .from("waivers_2026")
  .select("id, token, player_name, signed, pdf_path")
  .eq("signed", true)
  .is("pdf_path", null);

if (rowErr) {
  console.error("Waivers query failed:", rowErr.message);
  process.exit(1);
}

console.log(`Found ${rows.length} signed waiver(s) with NULL pdf_path`);

// 3. Match
const toUpdate = [];
const missingFiles = [];
for (const r of rows) {
  if (fileTokens.has(r.token)) {
    toUpdate.push(r);
  } else {
    missingFiles.push(r);
  }
}

console.log(`\nWill update: ${toUpdate.length}`);
for (const r of toUpdate) console.log(`  - ${r.player_name} (${r.token})`);

if (missingFiles.length) {
  console.log(`\nNo PDF in storage (skipped): ${missingFiles.length}`);
  for (const r of missingFiles) console.log(`  - ${r.player_name} (${r.token})`);
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write pdf_path.");
  process.exit(0);
}

// 4. Apply
let ok = 0;
let fail = 0;
for (const r of toUpdate) {
  const filePath = `2026/${r.token}.pdf`;
  const { error } = await supabase
    .from("waivers_2026")
    .update({ pdf_path: filePath })
    .eq("id", r.id);
  if (error) {
    console.error(`  FAIL ${r.player_name}: ${error.message}`);
    fail++;
  } else {
    ok++;
  }
}
console.log(`\nUpdated ${ok}, failed ${fail}`);
