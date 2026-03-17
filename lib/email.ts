import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Molloy Madness <onboarding@resend.dev>";
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function sendTeamWaiverEmail(
  toEmail: string,
  teamName: string,
  waivers: Array<{ token: string; player_name: string }>
) {
  const playerLines = waivers
    .map((w) => `  ${w.player_name}: ${BASE_URL}/waiver?token=${w.token}`)
    .join("\n");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `Molloy Madness Waiver — ${teamName}`,
    text: [
      `Thank you for registering ${teamName} for Molloy Madness!`,
      "",
      "Each player must sign the tournament waiver before game day.",
      "Please share these personal links with your teammates:",
      "",
      playerLines,
      "",
      "Each link is unique to a player — do not share links between players.",
      "",
      "See you on the court!",
      "— The Molloy Madness Team",
    ].join("\n"),
  });
}

export async function sendSinglesWaiverEmail(
  toEmail: string,
  playerName: string,
  token: string
) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness Waiver",
    text: [
      `Thank you for registering, ${playerName}!`,
      "",
      "Please sign your tournament waiver before game day:",
      "",
      `  ${BASE_URL}/waiver?token=${token}`,
      "",
      "See you on the court!",
      "— The Molloy Madness Team",
    ].join("\n"),
  });
}

export async function sendSinglesConfirmationEmail(
  toEmail: string,
  playerName: string,
  token: string
) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness — Free Agent Registration",
    text: [
      `Hey ${playerName},`,
      "",
      "Thanks for signing up as a free agent for Molloy Madness! We've added you to our list and will reach out once we've matched you with a team.",
      "",
      "In the meantime, please sign your tournament waiver so you're ready for game day:",
      "",
      `  ${BASE_URL}/waiver?token=${token}`,
      "",
      "Once you're matched with a team, the registration fee will be $40 per player.",
      "",
      "See you on the court!",
      "— The Molloy Madness Team",
    ].join("\n"),
  });
}

export async function sendVolunteerConfirmationEmail(
  toEmail: string,
  name: string,
  interests: string
) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness — Volunteer Confirmation",
    text: [
      `Hey ${name},`,
      "",
      "Thank you for volunteering for Molloy Madness! We really appreciate your help.",
      "",
      `You signed up to help with: ${interests}`,
      "",
      "We'll be in touch with more details as the tournament approaches.",
      "",
      "Thanks again!",
      "— The Molloy Madness Team",
    ].join("\n"),
  });
}
