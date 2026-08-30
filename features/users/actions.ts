"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { staffUserSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/rbac";
import type { ActionState } from "@/features/auth/actions";
import type { UserStatus } from "@prisma/client";

export async function createStaffUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = staffUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid user" };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email already in use." };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
      status: "ACTIVE",
      mustChangePassword: true,
    },
  });

  await writeAudit({
    actorId: admin.id,
    action: "CREATE_STAFF_USER",
    entityType: "User",
    entityId: user.id,
    metadata: { role: user.role },
  });
  revalidatePath("/staff/users");
  return { success: "Staff account created. They must change the password on first login." };
}

export async function setUserStatusAction(
  id: string,
  status: UserStatus,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (id === admin.id) return { error: "You cannot change your own status." };

  await prisma.user.update({
    where: { id },
    data: {
      status,
      sessionVersion: status === "SUSPENDED" ? { increment: 1 } : undefined,
    },
  });

  await writeAudit({
    actorId: admin.id,
    action: status === "SUSPENDED" ? "SUSPEND_USER" : "ACTIVATE_USER",
    entityType: "User",
    entityId: id,
  });
  revalidatePath("/staff/users");
  return { success: "User status updated." };
}

export async function setUserStatusFormAction(formData: FormData) {
  await setUserStatusAction(
    String(formData.get("id")),
    String(formData.get("status")) as UserStatus,
  );
}
