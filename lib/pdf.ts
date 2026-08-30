import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DocumentType } from "@prisma/client";
import { DOCUMENT_LABELS, formatResidentName } from "@/lib/constants";
import { absUrl } from "@/lib/qr";
import QRCode from "qrcode";

type CertificateInput = {
  type: DocumentType;
  controlNumber: string;
  purpose: string;
  validUntil: Date;
  issuedAt: Date;
  verifyPath: string;
  resident: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    suffix?: string | null;
    birthdate: Date;
    civilStatus: string;
  };
  address: string;
  purok: string;
  businessName?: string | null;
  businessAddress?: string | null;
  businessNature?: string | null;
  settings: {
    barangayName: string;
    cityMunicipality: string;
    province: string;
    address: string;
    captainName: string;
    secretaryName: string;
  };
};

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildCertificatePdf(input: CertificateInput) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  const navy = rgb(0.12, 0.25, 0.55);
  const ink = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.35, 0.38, 0.42);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 556,
    height: 736,
    borderColor: navy,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 36,
    y: 36,
    width: 540,
    height: 720,
    borderColor: rgb(0.83, 0.65, 0.18),
    borderWidth: 1,
  });

  let y = 720;
  const center = (text: string, size: number, f = font, color = ink) => {
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (612 - w) / 2, y, size, font: f, color });
  };

  center("Republic of the Philippines", 11, italic, muted);
  y -= 16;
  center(input.settings.province, 11, font, muted);
  y -= 16;
  center(input.settings.cityMunicipality, 11, font, muted);
  y -= 18;
  center(`Office of the Punong Barangay`, 12, bold, navy);
  y -= 16;
  center(input.settings.barangayName, 16, bold, navy);
  y -= 14;
  center(input.settings.address, 9, italic, muted);

  y -= 22;
  page.drawLine({
    start: { x: 72, y },
    end: { x: 540, y },
    thickness: 1,
    color: navy,
  });
  y -= 36;

  center(DOCUMENT_LABELS[input.type].toUpperCase(), 20, bold, navy);
  y -= 18;
  center(`Control No. ${input.controlNumber}`, 10, bold, muted);
  y -= 36;

  const name = formatResidentName(input.resident).toUpperCase();
  const body = [
    "TO WHOM IT MAY CONCERN:",
    "",
    `This is to certify that ${name}, of legal age, ${input.resident.civilStatus.toLowerCase()}, and a resident of ${input.address}, ${input.purok}, ${input.settings.barangayName}, ${input.settings.cityMunicipality}, ${input.settings.province}, is a bona fide resident of this barangay.`,
  ];

  if (input.type === "BARANGAY_CLEARANCE") {
    body.push(
      "",
      `This clearance is issued upon request of the above-named person for the purpose of ${input.purpose}.`,
    );
  } else if (input.type === "CERTIFICATE_OF_RESIDENCY") {
    body.push(
      "",
      `This certificate of residency is issued for the purpose of ${input.purpose}.`,
    );
  } else if (input.type === "CERTIFICATE_OF_INDIGENCY") {
    body.push(
      "",
      `This certifies that the above-named person belongs to an indigent family of this barangay. Issued for the purpose of ${input.purpose}.`,
    );
  } else if (input.type === "BUSINESS_CLEARANCE") {
    body.push(
      "",
      `This business clearance is issued for ${input.businessName ?? "the stated business"}, engaged in ${input.businessNature ?? "business"}, located at ${input.businessAddress ?? input.address}, for the purpose of ${input.purpose}.`,
    );
  }

  body.push(
    "",
    `Issued this ${input.issuedAt.toLocaleDateString("en-PH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} at ${input.settings.barangayName}, ${input.settings.cityMunicipality}.`,
    "",
    `Valid until ${input.validUntil.toLocaleDateString("en-PH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} unless sooner revoked.`,
  );

  for (const para of body) {
    if (!para) {
      y -= 10;
      continue;
    }
    const lines = wrap(para, 78);
    for (const line of lines) {
      page.drawText(line, {
        x: 72,
        y,
        size: 11,
        font: para === "TO WHOM IT MAY CONCERN:" ? bold : font,
        color: ink,
      });
      y -= 15;
    }
  }

  y -= 28;
  page.drawText(input.settings.secretaryName, {
    x: 72,
    y,
    size: 11,
    font: bold,
    color: ink,
  });
  page.drawText(input.settings.captainName, {
    x: 360,
    y,
    size: 11,
    font: bold,
    color: ink,
  });
  y -= 14;
  page.drawText("Barangay Secretary", { x: 72, y, size: 9, font, color: muted });
  page.drawText("Punong Barangay", { x: 360, y, size: 9, font, color: muted });

  const verifyUrl = absUrl(input.verifyPath);
  const qrPng = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 120 });
  const qrImage = await doc.embedPng(qrPng);
  page.drawImage(qrImage, { x: 460, y: 56, width: 88, height: 88 });
  page.drawText("Scan to verify", {
    x: 468,
    y: 48,
    size: 8,
    font,
    color: muted,
  });

  return doc.save();
}
