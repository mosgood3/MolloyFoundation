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

// ── Shared HTML email wrapper ──

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e293b;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#f59e0b;font-size:22px;font-weight:800;letter-spacing:0.5px;">MOLLOY MADNESS</h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">4th Annual 3v3 Tournament</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 4px;color:#64748b;font-size:13px;">May 16, 2026 &middot; 875 Day Hill Rd, Windsor, CT 06095</p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">Matthew C. Molloy Foundation</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:#f59e0b;border-radius:10px;padding:14px 28px;">
        <a href="${href}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:800;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.6;">${text}</p>`;
}

function note(text: string): string {
  return `<div style="margin:20px 0;padding:14px 18px;background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
    <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">${text}</p>
  </div>`;
}

function signoff(): string {
  return `<p style="margin:24px 0 0;color:#1e293b;font-size:15px;font-weight:600;">See you on the court!</p>
  <p style="margin:4px 0 0;color:#64748b;font-size:14px;">&mdash; The Molloy Madness Team</p>`;
}

// ── Email functions ──

export async function sendTeamWaiverEmail(
  toEmail: string,
  teamName: string,
  waivers: Array<{ token: string; player_name: string }>
) {
  const playerRows = waivers
    .map(
      (w) =>
        `<tr>
          <td style="padding:10px 14px;color:#1e293b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">${w.player_name}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;">
            <a href="${BASE_URL}/waiver?token=${w.token}" style="color:#f59e0b;font-size:13px;font-weight:600;text-decoration:none;">Sign Waiver &rarr;</a>
          </td>
        </tr>`
    )
    .join("");

  const html = emailWrapper(`
    ${heading(`Team Registered: ${teamName}`)}
    ${paragraph("Thank you for registering! Each player must sign the tournament waiver before game day.")}
    ${paragraph("Please share these personal links with your teammates:")}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <tr style="background-color:#f8fafc;">
        <td style="padding:10px 14px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Player</td>
        <td style="padding:10px 14px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Waiver</td>
      </tr>
      ${playerRows}
    </table>
    ${note("Each link is unique to a player &mdash; do not share links between players.")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `Molloy Madness Waiver — ${teamName}`,
    html,
  });
}

export async function sendSinglesWaiverEmail(
  toEmail: string,
  playerName: string,
  token: string
) {
  const html = emailWrapper(`
    ${heading(`Hey ${playerName}!`)}
    ${paragraph("Thank you for registering for Molloy Madness! Please sign your tournament waiver before game day.")}
    ${button(`${BASE_URL}/waiver?token=${token}`, "Sign Your Waiver")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness Waiver",
    html,
  });
}

export async function sendWaiverReminderEmail(
  toEmail: string,
  playerName: string,
  token: string
) {
  const html = emailWrapper(`
    ${heading(`Reminder for ${playerName}`)}
    ${paragraph("This is a friendly reminder to sign your Molloy Madness tournament waiver. All players must have a signed waiver before game day.")}
    ${button(`${BASE_URL}/waiver?token=${token}`, "Sign Your Waiver")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Reminder: Sign your Molloy Madness waiver",
    html,
  });
}

export async function sendSinglesConfirmationEmail(
  toEmail: string,
  playerName: string,
  token: string
) {
  const html = emailWrapper(`
    ${heading(`Welcome, ${playerName}!`)}
    ${paragraph("Thanks for signing up as a free agent for Molloy Madness! We've added you to our list and will reach out once we've matched you with a team.")}
    ${paragraph("In the meantime, please sign your tournament waiver so you're ready for game day:")}
    ${button(`${BASE_URL}/waiver?token=${token}`, "Sign Your Waiver")}
    ${note("Once you're matched with a team, the registration fee will be <strong>$40 per player</strong>.")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness — Free Agent Registration",
    html,
  });
}

export async function sendVolunteerConfirmationEmail(
  toEmail: string,
  name: string,
  interests: string
) {
  const badges = interests
    .split(", ")
    .map(
      (i) =>
        `<span style="display:inline-block;padding:6px 14px;margin:3px;background-color:#fef3c7;color:#92400e;font-size:13px;font-weight:600;border-radius:20px;">${i}</span>`
    )
    .join("");

  const html = emailWrapper(`
    ${heading(`Thank you, ${name}!`)}
    ${paragraph("We really appreciate you volunteering for Molloy Madness. Every helping hand makes a difference.")}
    ${paragraph("You signed up to help with:")}
    <div style="margin:12px 0 20px;">${badges}</div>
    ${paragraph("We'll be in touch with more details as the tournament approaches.")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Molloy Madness — Volunteer Confirmation",
    html,
  });
}

export async function sendDonationThankYouEmail(
  toEmail: string,
  amount: number,
  donorName: string | null
) {
  const greeting = donorName ? `Thank you, ${donorName}!` : "Thank you!";

  const html = emailWrapper(`
    ${heading(greeting)}
    ${paragraph(`Your generous donation of <strong>$${amount.toLocaleString()}</strong> to Molloy Madness makes a real difference.`)}
    ${paragraph("100% of every dollar goes directly to scholarships and charities in Matthew Molloy's name. No admin fees, no overhead &mdash; just impact.")}
    ${note("Your donation may be tax-deductible. Please consult your tax advisor. The Matthew C. Molloy Foundation is a registered 501(c)(3) nonprofit organization.")}
    ${paragraph("We're grateful for your support and generosity.")}
    ${signoff()}
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Thank You for Your Donation — Molloy Madness",
    html,
  });
}
