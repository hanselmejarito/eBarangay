import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.status === "SUSPENDED" || !session.user.id) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/login");
  }
  return user;
}

export async function requireStaff() {
  return requireRole("STAFF", "ADMIN");
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function getResidentContext(userId: string) {
  return prisma.resident.findUnique({
    where: { userId },
    include: { household: true },
  });
}

export async function assertHouseholdAccess(
  userId: string,
  subjectResidentId: string,
) {
  const me = await prisma.resident.findUnique({
    where: { userId },
    select: { householdId: true },
  });
  if (!me) return false;
  const subject = await prisma.resident.findUnique({
    where: { id: subjectResidentId },
    select: { householdId: true },
  });
  return Boolean(subject && subject.householdId === me.householdId);
}
