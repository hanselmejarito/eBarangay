import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import {
  countBudgetLines,
  listBudgetLines,
  listBudgetYears,
  yearBudgetTotals,
} from "@/lib/budget-sql";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";
import { BUDGET_CATEGORY_LABELS, pesos } from "@/lib/constants";
import { deleteBudgetLineFormAction } from "@/features/budget/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function StaffBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; page?: string; pageSize?: string }>;
}) {
  const current = new Date().getFullYear();
  const { year: yearParam, page, pageSize } = await searchParams;
  const years = await listBudgetYears();
  const year = Number(yearParam) || years[0] || current;
  const yearOptions = Array.from(new Set([year, current, ...years])).sort((a, b) => b - a);
  const paging = paginationFromSearch({ page, pageSize });
  const total = await countBudgetLines(year);
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const [rows, totals] = await Promise.all([
    listBudgetLines(year, { skip: meta.skip, take: meta.take }),
    yearBudgetTotals(year),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Budget monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Track allocations versus expenses for the barangay annual budget.
          </p>
        </div>
        <Button asChild>
          <Link href={`/staff/budget/new?year=${year}`}>Add allocation</Link>
        </Button>
      </div>
      <form className="flex flex-wrap gap-2">
        <input type="hidden" name="pageSize" value={String(meta.pageSize)} />
        <NativeSelect name="year" defaultValue={String(year)}>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="secondary">
          View year
        </Button>
      </form>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allocated
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pesos(totals.allocated)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pesos(totals.spent)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${totals.remaining < 0 ? "text-destructive" : ""}`}
          >
            {pesos(totals.remaining)}
          </CardContent>
        </Card>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No allocations for this year" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Allocation</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const remaining = row.allocated - row.spent;
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link href={`/staff/budget/${row.id}`} className="text-primary">
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {BUDGET_CATEGORY_LABELS[row.category] ?? row.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{pesos(row.allocated)}</TableCell>
                  <TableCell>{pesos(row.spent)}</TableCell>
                  <TableCell className={remaining < 0 ? "text-destructive" : ""}>
                    {pesos(remaining)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/budget/${row.id}`}>Update</Link>
                      </Button>
                      <form action={deleteBudgetLineFormAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <SubmitButton variant="ghost">Delete</SubmitButton>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/budget"
        query={{ year: String(year) }}
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
