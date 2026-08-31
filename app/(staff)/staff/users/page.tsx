import Link from "next/link";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateStaffForm } from "@/features/users/create-staff-form";
import { setUserStatusFormAction } from "@/features/users/actions";
import { SubmitButton } from "@/components/submit-button";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  PENDING_VERIFICATION: "Pending verification",
  SUSPENDED: "Suspended",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  await requireAdmin();
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.user.count();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { resident: true },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create staff, change a login email or password, suspend, or restore.
          Resident identity is approved in the verification queue, not here.
        </p>
      </div>
      <CreateStaffForm />
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{u.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {u.role}
                  {u.resident ? ` · ${u.resident.firstName} ${u.resident.lastName}` : ""}
                </span>
                <Badge
                  variant="secondary"
                  className={
                    u.status === "PENDING_VERIFICATION"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                      : u.status === "SUSPENDED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                        : undefined
                  }
                >
                  {STATUS_LABEL[u.status] ?? u.status}
                </Badge>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/staff/users/${u.id}`}>Update</Link>
              </Button>
              {u.status === "PENDING_VERIFICATION" && u.resident ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/staff/residents/${u.resident.id}`}>Verify</Link>
                </Button>
              ) : null}
              {u.status === "SUSPENDED" ? (
                <form action={setUserStatusFormAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="status" value="ACTIVE" />
                  <SubmitButton variant="outline" size="sm">
                    Activate
                  </SubmitButton>
                </form>
              ) : u.status === "ACTIVE" ? (
                <form action={setUserStatusFormAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="status" value="SUSPENDED" />
                  <SubmitButton variant="ghost" size="sm">
                    Suspend
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <ListPagination
        pathname="/staff/users"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
