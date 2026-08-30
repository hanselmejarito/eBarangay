import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";
import { formatResidentName } from "@/lib/constants";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function VerifyQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const where = { verificationStatus: "PENDING" as const };
  const total = await prisma.resident.count({ where });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.resident.findMany({
    where,
    include: { household: true },
    orderBy: { createdAt: "asc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Verification queue</h1>
      {rows.length === 0 ? (
        <EmptyState title="Queue is clear" description="No pending registrations." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/staff/residents/${r.id}`}
              className="flex justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <span>{formatResidentName(r)}</span>
              <span className="text-sm text-muted-foreground">
                {r.household.householdNumber}
              </span>
            </Link>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/staff/residents/verify"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
