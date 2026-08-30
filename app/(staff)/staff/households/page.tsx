import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { countActiveMembersByHousehold } from "@/lib/resident-sql";
import { formatResidentName } from "@/lib/constants";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function HouseholdsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.household.count();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const [rows, memberCounts] = await Promise.all([
    prisma.household.findMany({
      include: { head: true },
      orderBy: { householdNumber: "asc" },
      skip: meta.skip,
      take: meta.take,
    }),
    countActiveMembersByHousehold(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Households</h1>
        <Button asChild>
          <Link href="/staff/households/new">Add household</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No households" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Purok</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((h) => (
              <TableRow key={h.id}>
                <TableCell>
                  <Link href={`/staff/households/${h.id}`} className="text-primary">
                    {h.householdNumber}
                  </Link>
                </TableCell>
                <TableCell>{h.purok}</TableCell>
                <TableCell>{h.streetAddress}</TableCell>
                <TableCell>{h.head ? formatResidentName(h.head) : "—"}</TableCell>
                <TableCell>{memberCounts.get(h.id) ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/households"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
