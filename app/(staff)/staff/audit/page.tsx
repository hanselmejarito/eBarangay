import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  await requireAdmin();
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.auditLog.count();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Audit log</h1>
      <p className="text-sm text-muted-foreground">
        Sensitive actions are recorded. Metadata avoids dumping full personal records.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No audit events yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {r.createdAt.toLocaleString("en-PH")}
                </TableCell>
                <TableCell>{r.actor?.email ?? "system"}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>
                  {r.entityType}
                  {r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell className="text-xs">{r.ipAddress ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/audit"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
