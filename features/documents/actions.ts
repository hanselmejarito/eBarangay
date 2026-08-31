"use server";

import { revalidatePath } from "next/cache";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveBuffer } from "@/lib/files";
import { documentRequestSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import {
  assertHouseholdAccess,
  requireStaff,
  requireUser,
} from "@/lib/rbac";
import { feeForType, getSettings } from "@/lib/settings";
import { nextControlNumber } from "@/lib/control-number";
import { buildCertificatePdf } from "@/lib/pdf";
import { certificateToken } from "@/lib/qr";
import type { ActionState } from "@/features/auth/actions";

function parseRequestForm(formData: FormData) {
  return documentRequestSchema.safeParse({
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    subjectResidentId: formData.get("subjectResidentId"),
    businessName: formData.get("businessName") || undefined,
    businessAddress: formData.get("businessAddress") || undefined,
    businessNature: formData.get("businessNature") || undefined,
  });
}

async function assertEligibleDocumentSubject(subjectResidentId: string) {
  const subject = await prisma.resident.findUnique({
    where: { id: subjectResidentId },
  });
  if (!subject || subject.verificationStatus !== "VERIFIED") {
    return { error: "The subject resident is not verified." };
  }
  const moved = await prisma.$queryRaw<
    [{ residencyStatus: string; lifeStatus: string }]
  >`
    SELECT
      "residencyStatus"::text AS "residencyStatus",
      "lifeStatus"::text AS "lifeStatus"
    FROM "Resident"
    WHERE id = ${subject.id}
  `;
  if (moved[0]?.lifeStatus === "DECEASED") {
    return { error: "This person is recorded as deceased." };
  }
  if (moved[0]?.residencyStatus === "MOVED_OUT") {
    return {
      error:
        "This person has moved out. Staff must transfer them to a current household before requesting papers.",
    };
  }
  return { subject };
}

export async function createDocumentRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== "RESIDENT") {
    return { error: "Only residents can submit requests from the portal." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "Your account must be verified before requesting documents." };
  }

  const parsed = parseRequestForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const allowed = await assertHouseholdAccess(user.id, parsed.data.subjectResidentId);
  if (!allowed) return { error: "You can only request for your household." };

  const eligible = await assertEligibleDocumentSubject(parsed.data.subjectResidentId);
  if (eligible.error) return { error: eligible.error };

  const settings = await getSettings();
  const request = await prisma.documentRequest.create({
    data: {
      type: parsed.data.type,
      purpose: parsed.data.purpose,
      subjectResidentId: parsed.data.subjectResidentId,
      requestedByUserId: user.id,
      businessName: parsed.data.businessName,
      businessAddress: parsed.data.businessAddress,
      businessNature: parsed.data.businessNature,
      feeAmount: feeForType(settings, parsed.data.type),
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "CREATE_DOCUMENT_REQUEST",
    entityType: "DocumentRequest",
    entityId: request.id,
  });
  revalidatePath("/portal/requests");
  return { success: "Request submitted." };
}

export async function createWalkInDocumentRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = parseRequestForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const eligible = await assertEligibleDocumentSubject(parsed.data.subjectResidentId);
  if (eligible.error) return { error: eligible.error };

  const settings = await getSettings();
  const request = await prisma.documentRequest.create({
    data: {
      type: parsed.data.type,
      purpose: parsed.data.purpose,
      subjectResidentId: parsed.data.subjectResidentId,
      requestedByUserId: staff.id,
      businessName: parsed.data.businessName,
      businessAddress: parsed.data.businessAddress,
      businessNature: parsed.data.businessNature,
      feeAmount: feeForType(settings, parsed.data.type),
      staffNotes: "Walk-in at the barangay hall.",
    },
  });

  await writeAudit({
    actorId: staff.id,
    action: "WALK_IN_DOCUMENT_REQUEST",
    entityType: "DocumentRequest",
    entityId: request.id,
  });
  revalidatePath("/staff/requests");
  redirect(`/staff/requests/${request.id}`);
}

export async function updateRequestStatusAction(
  id: string,
  status: RequestStatus,
  formData?: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const existing = await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      subject: { include: { household: true } },
      certificate: true,
    },
  });
  if (!existing) return { error: "Request not found." };

  const rejectionReason = formData?.get("rejectionReason")
    ? String(formData.get("rejectionReason"))
    : undefined;
  const indigencyNote = formData?.get("indigencyNote")
    ? String(formData.get("indigencyNote"))
    : undefined;
  const staffNotes = formData?.get("staffNotes")
    ? String(formData.get("staffNotes"))
    : undefined;

  if (status === "REJECTED" && !rejectionReason) {
    return { error: "Provide a rejection reason." };
  }
  if (
    status === "APPROVED" &&
    existing.type === "CERTIFICATE_OF_INDIGENCY" &&
    !indigencyNote &&
    !existing.indigencyNote
  ) {
    return { error: "Add an indigency confirmation note before approving." };
  }

  if (status === "APPROVED" && !existing.certificate) {
    const settings = await getSettings();
    const issuedAt = new Date();
    const validUntil = new Date(issuedAt);
    validUntil.setDate(validUntil.getDate() + settings.certificateValidityDays);

    const { controlNumber, verifyToken, pdfPath } = await prisma.$transaction(
      async (tx) => {
        const controlNumber = await nextControlNumber(tx, existing.type);
        const verifyToken = certificateToken(id);
        const pdf = await buildCertificatePdf({
          type: existing.type,
          controlNumber,
          purpose: existing.purpose,
          validUntil,
          issuedAt,
          verifyPath: `/verify/certificate/${encodeURIComponent(verifyToken)}`,
          resident: existing.subject,
          address: existing.subject.household.streetAddress,
          purok: existing.subject.household.purok,
          businessName: existing.businessName,
          businessAddress: existing.businessAddress,
          businessNature: existing.businessNature,
          settings,
        });
        const pdfPath = await saveBuffer(pdf, "certificates", "pdf");
        return { controlNumber, verifyToken, pdfPath };
      },
    );

    await prisma.documentRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        controlNumber,
        indigencyNote: indigencyNote ?? existing.indigencyNote,
        staffNotes: staffNotes ?? existing.staffNotes,
        processedById: staff.id,
        certificate: {
          create: {
            verifyToken,
            pdfPath,
            validUntil,
            issuedById: staff.id,
            issuedAt,
          },
        },
      },
    });
  } else {
    await prisma.documentRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : existing.rejectionReason,
        indigencyNote: indigencyNote ?? existing.indigencyNote,
        staffNotes: staffNotes ?? existing.staffNotes,
        processedById: staff.id,
        releasedAt: status === "RELEASED" ? new Date() : existing.releasedAt,
      },
    });
  }

  await writeAudit({
    actorId: staff.id,
    action: `DOCUMENT_${status}`,
    entityType: "DocumentRequest",
    entityId: id,
  });
  revalidatePath("/staff/requests");
  revalidatePath(`/staff/requests/${id}`);
  revalidatePath("/portal/requests");
  return { success: `Request marked ${status.toLowerCase()}.` };
}

export async function markPaymentAction(
  id: string,
  paid: boolean,
): Promise<ActionState> {
  const staff = await requireStaff();
  await prisma.documentRequest.update({
    where: { id },
    data: { paymentStatus: paid ? "PAID" : "UNPAID" },
  });
  await writeAudit({
    actorId: staff.id,
    action: paid ? "MARK_PAID" : "MARK_UNPAID",
    entityType: "DocumentRequest",
    entityId: id,
  });
  revalidatePath(`/staff/requests/${id}`);
  return { success: paid ? "Marked paid." : "Marked unpaid." };
}

export async function updateRequestStatusFormAction(formData: FormData) {
  await updateRequestStatusAction(
    String(formData.get("id")),
    String(formData.get("status")) as RequestStatus,
    formData,
  );
}

export async function markPaymentFormAction(formData: FormData) {
  await markPaymentAction(String(formData.get("id")), formData.get("paid") === "true");
}
