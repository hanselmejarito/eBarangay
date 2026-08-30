import type { DocumentType, Prisma } from "@prisma/client";
import { DOCUMENT_PREFIX } from "@/lib/constants";

export async function nextControlNumber(
  tx: Prisma.TransactionClient,
  type: DocumentType,
) {
  const year = new Date().getFullYear();
  const row = await tx.controlCounter.upsert({
    where: { year_type: { year, type } },
    create: { year, type, last: 1 },
    update: { last: { increment: 1 } },
  });
  return `${DOCUMENT_PREFIX[type]}-${year}-${String(row.last).padStart(6, "0")}`;
}
