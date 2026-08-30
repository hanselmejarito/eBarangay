import Link from "next/link";
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
    include: { subject: true },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Document requests</h1>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/staff/requests/${r.id}`} className="text-primary">
                    {DOCUMENT_LABELS[r.type]}
                  </Link>
                </TableCell>
                <TableCell>{formatResidentName(r.subject)}</TableCell>
                <TableCell>
                  <StatusBadge value={r.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={r.paymentStatus} />
                </TableCell>
                <TableCell>{r.controlNumber ?? "—"}</TableCell>
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
