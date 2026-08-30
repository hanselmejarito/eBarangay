import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function PortalComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const user = await requireUser();
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const where = { reportedById: user.id };
  const total = await prisma.complaint.count({ where });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">My complaints</h1>
        <Button asChild>
          <Link href="/portal/complaints/new">New complaint</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No complaints" description="Report an issue in the barangay." />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{COMPLAINT_CATEGORY_LABELS[c.category]}</p>
                <p className="text-sm text-muted-foreground">{c.location}</p>
              </div>
              <StatusBadge value={c.status} />
            </div>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/portal/complaints"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
