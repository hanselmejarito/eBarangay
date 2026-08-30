import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import type { ComplaintStatus } from "@prisma/client";
import { NativeSelect } from "@/components/ui/native-select";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function StaffComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; pageSize?: string }>;
}) {
  const { status, page, pageSize } = await searchParams;
  const where = status ? { status: status as ComplaintStatus } : undefined;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.complaint.count({ where });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.complaint.findMany({
    where,
    include: { reportedBy: { include: { resident: true } } },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Complaints</h1>
      <form className="flex gap-2">
        <input type="hidden" name="pageSize" value={String(meta.pageSize)} />
        <NativeSelect name="status" defaultValue={status ?? ""}>
          <option value="">All</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
        </NativeSelect>
        <button className="rounded-md border px-3 text-sm" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="No complaints" />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/staff/complaints/${c.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{COMPLAINT_CATEGORY_LABELS[c.category]}</p>
                <p className="text-sm text-muted-foreground">{c.location}</p>
              </div>
              <StatusBadge value={c.status} />
            </Link>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/staff/complaints"
        query={{ status }}
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
