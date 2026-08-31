import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_LABELS, formatResidentName } from "@/lib/constants";
import type { RequestStatus } from "@prisma/client";
import { NativeSelect } from "@/components/ui/native-select";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function StaffRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; pageSize?: string }>;
}) {
  const { status, page, pageSize } = await searchParams;
  const where = status ? { status: status as RequestStatus } : undefined;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.documentRequest.count({ where });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.documentRequest.findMany({
    where,
    include: { subject: true, requestedBy: { select: { role: true } } },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold">Document requests</h1>
        <Button asChild>
          <Link href="/staff/requests/new">Walk-in request</Link>
        </Button>
      </div>
      <form className="flex gap-2">
        <input type="hidden" name="pageSize" value={String(meta.pageSize)} />
        <NativeSelect name="status" defaultValue={status ?? ""}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="APPROVED">Approved</option>
          <option value="RELEASED">Released</option>
          <option value="REJECTED">Rejected</option>
        </NativeSelect>
        <button className="rounded-md border px-3 text-sm" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="No requests" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Control no.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/staff/requests/${r.id}`} className="text-primary">
                    {DOCUMENT_LABELS[r.type]}
                  </Link>
                  {r.requestedBy.role !== "RESIDENT" ? (
                    <p className="text-xs text-muted-foreground">Walk-in</p>
                  ) : null}
                </TableCell>
                <TableCell>{formatResidentName(r.subject)}</TableCell>
                <TableCell>
                  <StatusBadge value={r.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={r.paymentStatus} />
                </TableCell>
                <TableCell>{r.controlNumber ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {r.status === "PENDING" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/staff/requests/${r.id}`}>Update</Link>
                    </Button>
                  ) : r.status === "REJECTED" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/staff/requests/${r.id}`}>Revise</Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/staff/requests/${r.id}`}>View</Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/requests"
        query={{ status }}
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
