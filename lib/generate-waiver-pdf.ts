import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

type WaiverPdfInput = {
  playerName: string;
  teamName: string | null;
  registrationType: string;
  signedName: string;
  guardianName?: string | null;
  signedAt: string;
};

/** Wraps text to fit within a given width, returning an array of lines. */
function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
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

export async function generateWaiverPdf(
  input: WaiverPdfInput
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const margin = 50;
  const pageWidth = 612; // US Letter
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 9;
  const lineHeight = 14;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function ensureSpace(needed: number) {
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
  y -= 30;

  // Player info
  const infoLines = [
    `Player: ${input.playerName}`,
    ...(input.teamName ? [`Team: ${input.teamName}`] : []),
    `Registration Type: ${input.registrationType}`,
  ];
  for (const line of infoLines) {
    page.drawText(line, { x: margin, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    y -= 18;
  }
  y -= 10;

  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;

  // Waiver body
  const wrappedLines = wrapText(WAIVER_TEXT, font, fontSize, maxWidth);
  for (const line of wrappedLines) {
    ensureSpace(lineHeight);
    if (line === "") {
      y -= lineHeight * 0.5;
      continue;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
    y -= lineHeight;
  }

  // Signature section
  y -= 20;
  ensureSpace(120);

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 25;

  page.drawText("ELECTRONIC SIGNATURE", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  y -= 22;

  // Signed name in italic to look like a signature
  page.drawText(input.signedName, {
    x: margin,
    y,
    size: 18,
    font: fontItalic,
    color: rgb(0.1, 0.1, 0.3),
  });
  y -= 24;

  page.drawText(`Signed by: ${input.signedName}`, {
    x: margin, y, size: 9, font, color: rgb(0.3, 0.3, 0.3),
  });
  y -= 16;

  if (input.guardianName) {
    page.drawText(`Parent/Guardian: ${input.guardianName}`, {
      x: margin, y, size: 9, font, color: rgb(0.3, 0.3, 0.3),
    });
    y -= 16;
  }

  const signedDate = new Date(input.signedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  page.drawText(`Date: ${signedDate}`, {
    x: margin, y, size: 9, font, color: rgb(0.3, 0.3, 0.3),
  });

  return pdf.save();
}
