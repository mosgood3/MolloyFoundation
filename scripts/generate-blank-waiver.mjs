// One-shot: generate a printable, blank Molloy Madness waiver PDF.
//
// Usage (from project root):
//   node scripts/generate-blank-waiver.mjs
//
// Output: public/molloy-madness-waiver.pdf

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const WAIVER_TEXT = `MOLLOY MADNESS 3v3 BASKETBALL TOURNAMENT — WAIVER AND RELEASE OF LIABILITY

MATTHEW C. MOLLOY FOUNDATION & DAY HILL DOME PARTNERS, LLC

By signing this waiver, I confirm that I am at least 14 years of age. If I am under 18, I confirm that my parent or legal guardian has reviewed this waiver and has given consent for my participation in the Molloy Madness 3v3 Basketball Tournament ("Event").

I, the undersigned participant, voluntarily agree to participate in the Event held at Day Hill Dome, 875 Day Hill Rd, Windsor, CT 06095, organized by the Matthew C. Molloy Foundation.

ASSUMPTION OF RISK: I am aware of the nature of, and possibility for injury with any sports activity, and I hereby assume responsibility for myself to participate. I understand that participation in this Event involves inherent risks, including but not limited to physical injury, and I voluntarily assume all such risks.

RELEASE AND WAIVER: I will not hold the Matthew C. Molloy Foundation, Day Hill Dome Partners, LLC (dba Day Hill Dome), and/or their officers, employees, volunteers, agents, or sponsors responsible in case of any accident or injury as a result of this participation. I hereby further agree to indemnify and hold harmless both parties from and against any and all loss, damage, claim, demand, liability, or expense by reason of any damage or injury to property or person which may be claimed to have arisen as a result of or in connection with participating in activities at the Event.

MEDICAL AUTHORIZATION: I grant Day Hill Dome Partners, LLC, the Matthew C. Molloy Foundation, and their staff permission to utilize any medical emergency services deemed necessary to treat injuries that I may incur while participating. I understand that neither organization provides insurance for program participants.

HEALTH ACKNOWLEDGEMENT: I agree, understand, and acknowledge, on my own behalf, that an inherent risk of exposure to COVID-19 and any other communicable or infectious disease exists in any public place where people are present.

MEDIA RELEASE: I grant permission to the Matthew C. Molloy Foundation and Day Hill Dome Partners, LLC to use photographs, video, or other media of my participation for promotional purposes.

I have read this waiver, fully understand its terms, and sign it freely and voluntarily.`;

function wrapText(text, font, fontSize, maxWidth) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let currentLine = "";
    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        currentLine = test;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

const margin = 50;
const pageWidth = 612;
const pageHeight = 792;
const maxWidth = pageWidth - margin * 2;
const bodySize = 9;
const lineHeight = 14;

let page = pdf.addPage([pageWidth, pageHeight]);
let y = pageHeight - margin;

function ensureSpace(needed) {
  if (y - needed < margin) {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
}

// Title
const title = "WAIVER AND RELEASE OF LIABILITY";
const titleSize = 14;
const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
page.drawText(title, {
  x: (pageWidth - titleWidth) / 2,
  y,
  size: titleSize,
  font: fontBold,
  color: rgb(0.15, 0.15, 0.15),
});
y -= 18;

const subtitle = "Molloy Madness 3v3 Basketball Tournament";
const subtitleSize = 10;
const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
page.drawText(subtitle, {
  x: (pageWidth - subtitleWidth) / 2,
  y,
  size: subtitleSize,
  font,
  color: rgb(0.35, 0.35, 0.35),
});
y -= 28;

// Fillable header fields (Player + Team)
function drawFillField(label, fieldX, fieldWidth) {
  page.drawText(label, {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawLine({
    start: { x: fieldX, y: y - 2 },
    end: { x: fieldX + fieldWidth, y: y - 2 },
    thickness: 0.6,
    color: rgb(0.5, 0.5, 0.5),
  });
}

drawFillField("Player Name:", margin + 80, maxWidth - 80);
y -= 22;
drawFillField("Team Name:", margin + 80, maxWidth - 80);
y -= 22;

// Divider
page.drawLine({
  start: { x: margin, y },
  end: { x: pageWidth - margin, y },
  thickness: 0.5,
  color: rgb(0.7, 0.7, 0.7),
});
y -= 18;

// Waiver body
const wrappedLines = wrapText(WAIVER_TEXT, font, bodySize, maxWidth);
for (const line of wrappedLines) {
  ensureSpace(lineHeight);
  if (line === "") {
    y -= lineHeight * 0.5;
    continue;
  }
  page.drawText(line, {
    x: margin,
    y,
    size: bodySize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= lineHeight;
}

// Signature section
y -= 24;
ensureSpace(160);

page.drawLine({
  start: { x: margin, y },
  end: { x: pageWidth - margin, y },
  thickness: 0.5,
  color: rgb(0.7, 0.7, 0.7),
});
y -= 22;

page.drawText("SIGNATURE", {
  x: margin,
  y,
  size: 11,
  font: fontBold,
  color: rgb(0.15, 0.15, 0.15),
});
y -= 30;

function drawSignatureLine(label, lineWidth = maxWidth - 90) {
  page.drawText(label, {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawLine({
    start: { x: margin + 90, y: y - 2 },
    end: { x: margin + 90 + lineWidth, y: y - 2 },
    thickness: 0.6,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 28;
}

drawSignatureLine("Signature:");
drawSignatureLine("Printed Name:");
drawSignatureLine("Date:", 200);

// Guardian section
y -= 6;
page.drawText("If participant is under 18, parent or legal guardian must sign:", {
  x: margin,
  y,
  size: 9,
  font,
  color: rgb(0.4, 0.4, 0.4),
});
y -= 22;

drawSignatureLine("Guardian Signature:");
drawSignatureLine("Printed Name:");

const bytes = await pdf.save();
const outPath = resolve(process.cwd(), "public", "molloy-madness-waiver.pdf");
writeFileSync(outPath, bytes);
console.log(`Wrote ${outPath} (${bytes.length} bytes)`);
