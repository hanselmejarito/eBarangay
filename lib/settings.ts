import { prisma } from "@/lib/prisma";
import type { DocumentType } from "@prisma/client";

export async function getSettings() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    throw new Error("System settings are not initialized. Run the database seed.");
  }
  return settings;
}

export function feeForType(
  settings: Awaited<ReturnType<typeof getSettings>>,
  type: DocumentType,
) {
  switch (type) {
    case "BARANGAY_CLEARANCE":
      return settings.clearanceFee;
    case "CERTIFICATE_OF_RESIDENCY":
      return settings.residencyFee;
    case "CERTIFICATE_OF_INDIGENCY":
      return settings.indigencyFee;
    case "BUSINESS_CLEARANCE":
      return settings.businessClearanceFee;
  }
}
