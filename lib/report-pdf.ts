import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { drawLogo, embedBagongPilipinas } from "@/lib/brand-assets";
import { formatResidentName } from "@/lib/constants";
import { formatManilaDateTime } from "@/lib/datetime";

type Row = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  contactNumber?: string | null;
  isSenior: boolean;
  isPwd: boolean;
  isSoloParent: boolean;
  isRegisteredVoter?: boolean;
  isSkVoter?: boolean;
  age?: number;
  household: { householdNumber: string; purok: string };
};

export async function buildResidentReportPdf({
  title,
  barangayName,
  cityMunicipality,
  generatedAt,
  rows,
}: {
  title: string;
  barangayName: string;
  cityMunicipality: string;
  generatedAt: Date;
  rows: Row[];
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.4, 0.42, 0.45);

  let page = doc.addPage([612, 792]);
  let y = 750;

  const newPage = () => {
    page = doc.addPage([612, 792]);
    y = 750;
  };

  const bagongPilipinas = await embedBagongPilipinas(doc);
  if (bagongPilipinas) {
    drawLogo(page, bagongPilipinas, { right: 564, top: 762, height: 48 });
  }

  page.drawText(barangayName, { x: 48, y, size: 14, font: bold, color: ink });
  y -= 16;
  page.drawText(cityMunicipality, { x: 48, y, size: 10, font, color: muted });
  y -= 20;
  page.drawText(title, { x: 48, y, size: 16, font: bold, color: ink });
  y -= 14;
  page.drawText(
    `Generated ${formatManilaDateTime(generatedAt)} · ${rows.length} record(s)`,
    { x: 48, y, size: 9, font, color: muted },
  );
  y -= 24;

  const seniors = rows.filter((r) => r.isSenior).length;
  const pwds = rows.filter((r) => r.isPwd).length;
  const solos = rows.filter((r) => r.isSoloParent).length;
  const voters = rows.filter((r) => {
    const age = r.age;
    return age != null && age >= 18 && (r.isRegisteredVoter || r.isSkVoter);
  }).length;
  const sk = rows.filter((r) => r.isSkVoter && r.age != null && r.age >= 15 && r.age <= 30).length;
  page.drawText(
    `Senior: ${seniors}   PWD: ${pwds}   Solo parent: ${solos}   Voters: ${voters}   SK: ${sk}`,
    {
    x: 48,
    y,
    size: 10,
    font: bold,
    color: ink,
  });
  y -= 22;

  for (const [i, r] of rows.entries()) {
    if (y < 60) newPage();
    const tags = [
      r.age != null ? `Age ${r.age}` : null,
      r.age != null && r.age >= 18 && (r.isRegisteredVoter || r.isSkVoter) ? "Voter" : null,
      r.isSkVoter && r.age != null && r.age >= 15 && r.age <= 30 ? "SK" : null,
      r.isSenior ? "Senior" : null,
      r.isPwd ? "PWD" : null,
      r.isSoloParent ? "Solo parent" : null,
    ]
      .filter(Boolean)
      .join(", ");
    page.drawText(`${i + 1}. ${formatResidentName(r)}`, {
      x: 48,
      y,
      size: 10,
      font: bold,
      color: ink,
    });
    y -= 12;
    page.drawText(
      `${r.household.householdNumber} · ${r.household.purok} · ${r.contactNumber ?? "—"} · ${tags || "—"}`,
      { x: 60, y, size: 9, font, color: muted },
    );
    y -= 16;
  }

  return doc.save();
}
