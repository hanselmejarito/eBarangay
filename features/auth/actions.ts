"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { isRegularVoterAge, isSkAge, yearsOld } from "@/lib/age";
import { saveUpload } from "@/lib/files";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations";
import { requireUser } from "@/lib/rbac";
import { ROLE_HOME } from "@/lib/constants";

export type ActionState = { error?: string; success?: string };

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  const next = String(formData.get("next") ?? "");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or the account is locked." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  await writeAudit({
    actorId: user?.id,
    action: "LOGIN",
    entityType: "User",
    entityId: user?.id,
  });

  const dest =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : user
        ? ROLE_HOME[user.role]
        : "/";
  redirect(dest);
}

export async function logoutAction() {
  const user = await requireUser().catch(() => null);
  if (user) {
    await writeAudit({
      actorId: user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: user.id,
    });
  }
  await signOut({ redirectTo: "/" });
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    suffix: formData.get("suffix") || undefined,
    birthdate: formData.get("birthdate"),
    gender: formData.get("gender"),
    civilStatus: formData.get("civilStatus"),
    contactNumber: formData.get("contactNumber"),
    householdNumber: formData.get("householdNumber") || undefined,
    purok: formData.get("purok"),
    streetAddress: formData.get("streetAddress"),
    isSenior: formData.get("isSenior") === "on",
    isPwd: formData.get("isPwd") === "on",
    isSoloParent: formData.get("isSoloParent") === "on",
    isRegisteredVoter: formData.get("isRegisteredVoter") === "on",
    isSkVoter: formData.get("isSkVoter") === "on",
    relation: formData.get("relation") || "MEMBER",
    privacyConsent: formData.get("privacyConsent") === "on" ? true : false,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with this email already exists." };

  const idFile = formData.get("idDocument");
  if (!(idFile instanceof File) || idFile.size === 0) {
    return { error: "Upload a photo of a valid government ID." };
  }

  let idPath: string;
  try {
    idPath = await saveUpload(idFile, "ids");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save ID." };
  }

  const photo = formData.get("photo");
  let photoPath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveUpload(photo, "photos");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not save photo." };
    }
  }

  let householdId: string;
  if (parsed.data.householdNumber) {
    const existing = await prisma.household.findUnique({
      where: { householdNumber: parsed.data.householdNumber },
    });
    if (!existing) {
      return { error: "Household number was not found. Leave it blank to request a new household." };
    }
    householdId = existing.id;
  } else {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const created = await prisma.household.create({
      data: {
        householdNumber: `TMP-${new Date().getFullYear()}-${suffix}`,
        purok: parsed.data.purok,
        streetAddress: parsed.data.streetAddress,
      },
    });
    householdId = created.id;
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "RESIDENT",
      status: "PENDING_VERIFICATION",
    },
  });

  const resident = await prisma.resident.create({
    data: {
      userId: user.id,
      householdId,
      firstName: parsed.data.firstName,
      middleName: parsed.data.middleName,
      lastName: parsed.data.lastName,
      suffix: parsed.data.suffix,
      birthdate: new Date(parsed.data.birthdate),
      gender: parsed.data.gender,
      civilStatus: parsed.data.civilStatus,
      contactNumber: parsed.data.contactNumber,
      isSenior: Boolean(parsed.data.isSenior),
      isPwd: Boolean(parsed.data.isPwd),
      isSoloParent: Boolean(parsed.data.isSoloParent),
      verificationStatus: "PENDING",
      idDocumentPath: idPath,
      photoPath,
      privacyConsentAt: new Date(),
    },
  });

  const rel = parsed.data.relation === "BOARDER" ? "BOARDER" : "MEMBER";
  await prisma.$executeRaw`
    UPDATE "Resident" SET "relation" = ${rel}::"HouseholdRelation" WHERE id = ${resident.id}
  `;
  const age = yearsOld(new Date(parsed.data.birthdate));
  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "isRegisteredVoter" = ${Boolean(parsed.data.isRegisteredVoter) && isRegularVoterAge(age)},
        "isSkVoter" = ${Boolean(parsed.data.isSkVoter) && isSkAge(age)}
    WHERE id = ${resident.id}
  `;

  const household = await prisma.household.findUnique({
    where: { id: householdId },
  });
  if (
    household &&
    !household.headResidentId &&
    (parsed.data.relation ?? "MEMBER") === "MEMBER"
  ) {
    await prisma.household.update({
      where: { id: householdId },
      data: { headResidentId: resident.id },
    });
  }

  await writeAudit({
    actorId: user.id,
    action: "REGISTER",
    entityType: "Resident",
    entityId: resident.id,
  });

  redirect("/login?registered=1");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const ok = await bcrypt.compare(parsed.data.currentPassword, db.passwordHash);
  if (!ok) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.newPassword, 10),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "CHANGE_PASSWORD",
    entityType: "User",
    entityId: user.id,
  });

  return { success: "Password updated. Sign in again." };
}
