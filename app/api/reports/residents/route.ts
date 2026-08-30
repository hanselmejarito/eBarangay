import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { getSettings } from "@/lib/settings";
import { buildResidentReportPdf } from "@/lib/report-pdf";
import { listReportResidentsSql } from "@/lib/resident-sql";
import { yearsOld } from "@/lib/age";

const TITLES = {
  all: "Verified resident registry",
  voter: "Regular voters (18+)",
  sk: "SK voters (15–30)",
  senior: "Senior citizen report",
  pwd: "PWD report",
  solo: "Solo parent report",
  deceased: "Deceased residents",
} as const;

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "STAFF" && session?.user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const tag = (url.searchParams.get("tag") ?? "all") as keyof typeof TITLES;
  const format = url.searchParams.get("format") ?? "pdf";
  if (!(tag in TITLES)) {
    return new NextResponse("Invalid report type", { status: 400 });
  }

  const listed = await listReportResidentsSql(tag);
  const rows = listed.map((r) => ({
    ...r,
    age: yearsOld(r.birthdate),
    household: { householdNumber: r.householdNumber, purok: r.purok },
  }));

  await writeAudit({
    actorId: session.user.id,
    action: "GENERATE_REPORT",
    entityType: "Resident",
    metadata: { tag, format, count: rows.length },
  });

  if (format === "csv") {
    const header = [
      "Last name",
      "First name",
      "Middle name",
      "Household",
      "Purok",
      "Contact",
      "Age",
      "Regular voter",
      "SK voter",
      "Senior",
      "PWD",
      "Solo parent",
    ];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.lastName,
          r.firstName,
          r.middleName ?? "",
          r.household.householdNumber,
          r.household.purok,
          r.contactNumber ?? "",
          r.age,
          r.age >= 18 && (r.isRegisteredVoter || r.isSkVoter) ? "Yes" : "No",
          r.isSkVoter && r.age >= 15 && r.age <= 30 ? "Yes" : "No",
          r.isSenior ? "Yes" : "No",
          r.isPwd ? "Yes" : "No",
          r.isSoloParent ? "Yes" : "No",
        ]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${tag}-residents.csv"`,
      },
    });
  }

  const settings = await getSettings();
  const pdf = await buildResidentReportPdf({
    title: TITLES[tag],
    barangayName: settings.barangayName,
    cityMunicipality: `${settings.cityMunicipality}, ${settings.province}`,
    generatedAt: new Date(),
    rows,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${tag}-residents.pdf"`,
    },
  });
}
