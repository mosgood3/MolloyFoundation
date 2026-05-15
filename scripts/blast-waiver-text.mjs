// One-off blast SMS to team captains whose roster has at least one pending waiver.
//
// Usage (from project root, Node 22+):
//   node --env-file=.env.local scripts/blast-waiver-text.mjs
//       → dry-run, prints every message that would be sent.
//
//   node --env-file=.env.local scripts/blast-waiver-text.mjs --send --to 8606041322
//       → sends every message to the given test number (good for previewing).
//
//   node --env-file=.env.local scripts/blast-waiver-text.mjs --send
//       → actually sends each message to its team's phone. THIS IS LIVE.
//
// Required env (.env.local):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_PHONE_NUMBER   (e.g. +18605551234)

import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const args = process.argv.slice(2);
const send = args.includes("--send");
const toArgIdx = args.indexOf("--to");
const testToOverride =
  toArgIdx >= 0 && args[toArgIdx + 1] ? args[toArgIdx + 1] : null;

const SUPPORT_PHONE = "860-604-1322";

function formatPhone(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 0) return `+${digits}`;
  return null;
}

function buildMessage(teamName, pending) {
  const lines = pending
    .map((p) => `- ${p.player_name} (${p.player_email})`)
    .join("\n");
  return [
    `Molloy Madness — ${teamName}: we're still waiting on waivers from:`,
    "",
    lines,
    "",
    `Game day is May 16, please sign ASAP. Can't find the email? Text ${SUPPORT_PHONE} and we'll resend it.`,
  ].join("\n");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. Pull pending team waivers.
const { data: pendingWaivers, error: waiverErr } = await supabase
  .from("waivers_2026")
  .select("player_name, player_email, team_name")
  .eq("registration_type", "team")
  .eq("signed", false);

if (waiverErr) {
  console.error("Failed to load waivers:", waiverErr.message);
  process.exit(1);
}

// 2. Group by team.
const byTeam = new Map();
for (const w of pendingWaivers ?? []) {
  if (!w.team_name) continue;
  if (!byTeam.has(w.team_name)) byTeam.set(w.team_name, []);
  byTeam.get(w.team_name).push(w);
}

if (byTeam.size === 0) {
  console.log("No teams have pending waivers. Nothing to send.");
  process.exit(0);
}

// 3. Look up team phones.
const teamNames = Array.from(byTeam.keys());
const { data: teamRows, error: teamErr } = await supabase
  .from("teams_2026")
  .select("team_name, team_phone")
  .in("team_name", teamNames);

if (teamErr) {
  console.error("Failed to load team phones:", teamErr.message);
  process.exit(1);
}

const phoneByTeam = new Map();
for (const t of teamRows ?? []) {
  if (t.team_phone) phoneByTeam.set(t.team_name, t.team_phone);
}

// 4. Build a send plan.
const plan = [];
const skipped = [];
for (const [teamName, pending] of byTeam) {
  const rawPhone = phoneByTeam.get(teamName);
  if (!rawPhone) {
    skipped.push({ teamName, reason: "no team_phone on file" });
    continue;
  }
  const formatted = formatPhone(rawPhone);
  if (!formatted) {
    skipped.push({ teamName, reason: `invalid phone: ${rawPhone}` });
    continue;
  }
  plan.push({
    teamName,
    pendingCount: pending.length,
    realPhone: formatted,
    body: buildMessage(teamName, pending),
  });
}

console.log(
  `\n${plan.length} team(s) to text, ${skipped.length} skipped, ${
    pendingWaivers?.length ?? 0
  } total pending waivers.\n`
);

if (skipped.length) {
  console.log("Skipped:");
  for (const s of skipped) console.log(`  - ${s.teamName}: ${s.reason}`);
  console.log();
}

// 5. Dry-run preview.
if (!send) {
  for (const p of plan) {
    console.log("───────────────────────────────────────");
    console.log(`To:   ${p.realPhone}  (${p.teamName}, ${p.pendingCount} pending)`);
    console.log(p.body);
  }
  console.log("\nDry-run only. Re-run with --send (and optionally --to <number>) to actually send.");
  process.exit(0);
}

// 6. Live send.
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
if (!sid || !token || !from) {
  console.error(
    "Missing Twilio env vars. Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER."
  );
  process.exit(1);
}

const client = twilio(sid, token);
const override = testToOverride ? formatPhone(testToOverride) : null;
if (override) {
  console.log(`** Test mode: all messages will be sent to ${override} **\n`);
}

let sent = 0;
let failed = 0;
for (const p of plan) {
  const to = override ?? p.realPhone;
  try {
    const msg = await client.messages.create({ to, from, body: p.body });
    console.log(`✓ ${p.teamName} → ${to}  (SID: ${msg.sid})`);
    sent++;
  } catch (e) {
    console.error(`✗ ${p.teamName} → ${to}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
