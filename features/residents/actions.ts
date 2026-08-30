"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { residentSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import { setResidentVoterFlags } from "@/lib/resident-sql";
import type { ActionState } from "@/features/auth/actions";

export async function createResidentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = residentSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    suffix: formData.get("suffix") || undefined,
    birthdate: formData.get("birthdate"),
    gender: formData.get("gender"),
    civilStatus: formData.get("civilStatus"),
    contactNumber: formData.get("contactNumber") || undefined,
    householdId: formData.get("householdId"),
    isSenior: formData.get("isSenior") === "on",
    isPwd: formData.get("isPwd") === "on",
    isSoloParent: formData.get("isSoloParent") === "on",
    isRegisteredVoter: formData.get("isRegisteredVoter") === "on",
    isSkVoter: formData.get("isSkVoter") === "on",
    remarks: formData.get("remarks") || undefined,
    relation: formData.get("relation") || "MEMBER",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid resident" };
  }

  const photo = formData.get("photo");
  let photoPath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    photoPath = await saveUpload(photo, "photos");
  }

  const { relation, isRegisteredVoter, isSkVoter, ...residentFields } = parsed.data;
  const resident = await prisma.resident.create({
    data: {
      ...residentFields,
      birthdate: new Date(parsed.data.birthdate),
      isSenior: Boolean(parsed.data.isSenior),
      isPwd: Boolean(parsed.data.isPwd),
      isSoloParent: Boolean(parsed.data.isSoloParent),
      verificationStatus: "VERIFIED",
      verifiedById: staff.id,
      verifiedAt: new Date(),
      photoPath,
    },
  });
  const rel = relation === "BOARDER" ? "BOARDER" : "MEMBER";
  await prisma.$executeRaw`
    UPDATE "Resident" SET "relation" = ${rel}::"HouseholdRelation" WHERE id = ${resident.id}
  `;
  await setResidentVoterFlags(
    resident.id,
    Boolean(isRegisteredVoter),
    Boolean(isSkVoter),
    new Date(parsed.data.birthdate),
  );

  await writeAudit({
    actorId: staff.id,
    action: "CREATE_RESIDENT",
    entityType: "Resident",
    entityId: resident.id,
  });
  revalidatePath("/staff/residents");
  return { success: "Resident added." };
}

export async function updateResidentAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = residentSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    suffix: formData.get("suffix") || undefined,
    birthdate: formData.get("birthdate"),
    gender: formData.get("gender"),
    civilStatus: formData.get("civilStatus"),
    contactNumber: formData.get("contactNumber") || undefined,
    householdId: formData.get("householdId"),
    isSenior: formData.get("isSenior") === "on",
    isPwd: formData.get("isPwd") === "on",
    isSoloParent: formData.get("isSoloParent") === "on",
    isRegisteredVoter: formData.get("isRegisteredVoter") === "on",
    isSkVoter: formData.get("isSkVoter") === "on",
    remarks: formData.get("remarks") || undefined,
    relation: formData.get("relation") || "MEMBER",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid resident" };
  }

  const photo = formData.get("photo");
  let photoPath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    photoPath = await saveUpload(photo, "photos");
  }

  const { relation, isRegisteredVoter, isSkVoter, ...residentFields } = parsed.data;
  await prisma.resident.update({
    where: { id },
    data: {
      ...residentFields,
      birthdate: new Date(parsed.data.birthdate),
      isSenior: Boolean(parsed.data.isSenior),
      isPwd: Boolean(parsed.data.isPwd),
      isSoloParent: Boolean(parsed.data.isSoloParent),
      ...(photoPath ? { photoPath } : {}),
    },
  });
  const rel = relation === "BOARDER" ? "BOARDER" : "MEMBER";
  await prisma.$executeRaw`
    UPDATE "Resident" SET "relation" = ${rel}::"HouseholdRelation" WHERE id = ${id}
  `;
  await setResidentVoterFlags(
    id,
    Boolean(isRegisteredVoter),
    Boolean(isSkVoter),
    new Date(parsed.data.birthdate),
  );

  await writeAudit({
    actorId: staff.id,
    action: "UPDATE_RESIDENT",
    entityType: "Resident",
    entityId: id,
  });
  revalidatePath("/staff/residents");
  revalidatePath(`/staff/residents/${id}`);
  return { success: "Resident updated." };
}

export async function verifyResidentAction(
  id: string,
  decision: "VERIFIED" | "REJECTED",
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  if (decision === "REJECTED" && !reason) {
    return { error: "Provide a rejection reason." };
  }

  const existing = await prisma.resident.findUnique({ where: { id } });
  if (!existing) return { error: "Resident not found." };

  const resident = await prisma.resident.update({
    where: { id },
    data: {
      verificationStatus: decision,
      verifiedById: staff.id,
      verifiedAt: new Date(),
      rejectionReason: decision === "REJECTED" ? reason : null,
    },
  });

  if (existing.userId && decision === "VERIFIED") {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { status: "ACTIVE" },
    });
  }

  await writeAudit({
    actorId: staff.id,
    action: decision === "VERIFIED" ? "VERIFY_RESIDENT" : "REJECT_RESIDENT",
    entityType: "Resident",
    entityId: id,
    metadata: { reason: reason || undefined },
  });
  revalidatePath("/staff/residents");
  revalidatePath("/staff/residents/verify");
  return {
    success:
      decision === "VERIFIED"
        ? `${resident.firstName} is now verified.`
        : "Registration rejected.",
  };
}

export async function verifyResidentFormAction(formData: FormData) {
  await verifyResidentAction(
    String(formData.get("id")),
    String(formData.get("decision")) as "VERIFIED" | "REJECTED",
    formData,
  );
}

export async function moveOutResidentFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));
  const note = String(formData.get("movedOutNote") ?? "").trim();
  if (!note) return;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) return;

  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "residencyStatus" = 'MOVED_OUT'::"ResidencyStatus",
        "movedOutAt" = NOW(),
        "movedOutNote" = ${note}
    WHERE id = ${id}
  `;
  await prisma.household.updateMany({
    where: { headResidentId: id },
    data: { headResidentId: null },
  });

  await writeAudit({
    actorId: staff.id,
    action: "MOVE_OUT_RESIDENT",
    entityType: "Resident",
    entityId: id,
    metadata: { note },
  });
  revalidatePath("/staff/residents");
  revalidatePath(`/staff/residents/${id}`);
  revalidatePath("/staff/households");
}

export async function markDeceasedFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));
  const note = String(formData.get("deathNote") ?? "").trim();
  if (!note) return;

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) return;

  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "lifeStatus" = 'DECEASED'::"LifeStatus",
        "deceasedAt" = NOW(),
        "deathNote" = ${note}
    WHERE id = ${id}
  `;
  await prisma.household.updateMany({
    where: { headResidentId: id },
    data: { headResidentId: null },
  });

  await writeAudit({
    actorId: staff.id,
    action: "MARK_DECEASED",
    entityType: "Resident",
    entityId: id,
    metadata: { note },
  });
  revalidatePath("/staff/residents");
  revalidatePath(`/staff/residents/${id}`);
  revalidatePath("/staff/households");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/reports");
}

export async function restoreLivingFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));

  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "lifeStatus" = 'ALIVE'::"LifeStatus",
        "deceasedAt" = NULL,
        "deathNote" = NULL
    WHERE id = ${id}
  `;

  await writeAudit({
    actorId: staff.id,
    action: "RESTORE_LIVING",
    entityType: "Resident",
    entityId: id,
  });
  revalidatePath("/staff/residents");
  revalidatePath(`/staff/residents/${id}`);
  revalidatePath("/staff/households");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/reports");
}

export async function transferResidentFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));
  const householdId = String(formData.get("householdId") ?? "");
  const relation = formData.get("relation") === "BOARDER" ? "BOARDER" : "MEMBER";
  if (!householdId) return;

  const life = await prisma.$queryRaw<[{ lifeStatus: string }]>`
    SELECT "lifeStatus"::text AS "lifeStatus" FROM "Resident" WHERE id = ${id}
  `;
  if (life[0]?.lifeStatus === "DECEASED") return;

  await prisma.household.updateMany({
    where: { headResidentId: id },
    data: { headResidentId: null },
  });
  await prisma.resident.update({
    where: { id },
    data: { householdId },
  });
  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "relation" = ${relation}::"HouseholdRelation",
        "residencyStatus" = 'ACTIVE'::"ResidencyStatus",
        "movedOutAt" = NULL,
        "movedOutNote" = NULL
    WHERE id = ${id}
  `;

  await writeAudit({
    actorId: staff.id,
    action: "TRANSFER_RESIDENT",
    entityType: "Resident",
    entityId: id,
    metadata: { householdId, relation },
  });
  revalidatePath("/staff/residents");
  revalidatePath(`/staff/residents/${id}`);
  revalidatePath("/staff/households");
}
