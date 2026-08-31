import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { DOCUMENT_LABELS, formatResidentName } from "@/lib/constants";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function PortalRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const user = await requireUser();
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const where = { requestedByUserId: user.id };
  const total = await prisma.documentRequest.count({ where });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.documentRequest.findMany({
    where,
    include: { subject: true },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Document requests</h1>
        <Button asChild>
          <Link href="/portal/requests/new">New request</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Request a clearance or certificate for yourself or a household member."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Control no.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/portal/requests/${r.id}`} className="text-primary">
                    {DOCUMENT_LABELS[r.type]}
                  </Link>
                </TableCell>
                <TableCell>{formatResidentName(r.subject)}</TableCell>
                <TableCell>
                  <StatusBadge value={r.status} />
                </TableCell>
                <TableCell>{r.controlNumber ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {r.status === "REJECTED" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/portal/requests/${r.id}?edit=1`}>Revise</Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/portal/requests/${r.id}`}>View</Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/portal/requests"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
