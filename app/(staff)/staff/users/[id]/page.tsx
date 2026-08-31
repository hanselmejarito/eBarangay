import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EditUserForm } from "@/features/users/edit-user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { resident: true },
  });
  if (!user) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Update account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.role}
          {user.resident
            ? ` · ${user.resident.firstName} ${user.resident.lastName}`
            : ""}
        </p>
      </div>
      <EditUserForm id={user.id} email={user.email} />
      <Button variant="outline" asChild>
        <Link href="/staff/users">Back to users</Link>
      </Button>
    </div>
  );
}
