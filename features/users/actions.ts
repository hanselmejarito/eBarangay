"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { staffUserSchema, updateUserAccountSchema } from "@/lib/validations";
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

export async function updateUserAccountAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = updateUserAccountSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid account" };
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (taken) return { error: "Email already in use." };

  const data: {
    email: string;
    passwordHash?: string;
    mustChangePassword?: boolean;
    sessionVersion?: { increment: number };
  } = { email };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    data.mustChangePassword = id !== admin.id;
    data.sessionVersion = { increment: 1 };
  } else {
    data.sessionVersion = { increment: 1 };
  }

  await prisma.user.update({ where: { id }, data });

  await writeAudit({
    actorId: admin.id,
    action: parsed.data.password ? "UPDATE_USER_ACCOUNT" : "UPDATE_USER_EMAIL",
    entityType: "User",
    entityId: id,
    metadata: { email },
  });
  revalidatePath("/staff/users");
  revalidatePath(`/staff/users/${id}`);
  return {
    success: parsed.data.password
      ? "Email and password updated. They must sign in again."
      : "Email updated. They must sign in again.",
  };
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
