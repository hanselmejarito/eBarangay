"use server";

import { revalidatePath } from "next/cache";
import type { ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { complaintSchema } from "@/lib/validations";
import { requireStaff, requireUser } from "@/lib/rbac";
import type { ActionState } from "@/features/auth/actions";

export async function createComplaintAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = complaintSchema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    location: formData.get("location"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid complaint" };
  }

  const photos = formData.getAll("photos");
  const photoPaths: string[] = [];
  for (const photo of photos) {
    if (photo instanceof File && photo.size > 0) {
      photoPaths.push(await saveUpload(photo, "complaints"));
    }
  }

  const complaint = await prisma.complaint.create({
    data: {
      ...parsed.data,
      photoPaths,
      reportedById: user.id,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "CREATE_COMPLAINT",
    entityType: "Complaint",
    entityId: complaint.id,
  });
  revalidatePath("/portal/complaints");
  return { success: "Complaint submitted." };
}

export async function updateComplaintStatusAction(
  id: string,
  status: ComplaintStatus,
  formData?: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const resolutionNotes = formData?.get("resolutionNotes")
    ? String(formData.get("resolutionNotes"))
    : undefined;

  await prisma.complaint.update({
    where: { id },
    data: {
      status,
      assignedToId: staff.id,
      resolutionNotes,
    },
  });

  await writeAudit({
    actorId: staff.id,
    action: `COMPLAINT_${status}`,
    entityType: "Complaint",
    entityId: id,
  });
  revalidatePath("/staff/complaints");
  revalidatePath(`/staff/complaints/${id}`);
  return { success: "Complaint updated." };
}

export async function updateComplaintStatusFormAction(formData: FormData) {
  return updateComplaintStatusAction(
    String(formData.get("id")),
    String(formData.get("status")) as ComplaintStatus,
    formData,
  );
}
