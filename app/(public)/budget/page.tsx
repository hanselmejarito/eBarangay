import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listBudgetLines, listBudgetYears, yearBudgetTotals } from "@/lib/budget-sql";
import { BUDGET_CATEGORY_LABELS, pesos } from "@/lib/constants";

export default async function PublicBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const years = await listBudgetYears();
  const year = Number(yearParam) || years[0] || new Date().getFullYear();
  const [rows, totals] = await Promise.all([
    listBudgetLines(year),
    yearBudgetTotals(year),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Budget {year}</h1>
      <p className="mt-2 text-muted-foreground">
        Public summary of barangay allocations and spending. Detailed vouchers stay
        with the hall.
      </p>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No budget posted for this year" />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Allocated</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {pesos(totals.allocated)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Spent</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{pesos(totals.spent)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Remaining</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {pesos(totals.remaining)}
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 space-y-3">
            {rows.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <Badge variant="outline">
                      {BUDGET_CATEGORY_LABELS[row.category] ?? row.category}
                    </Badge>
                    <CardTitle className="mt-2 text-lg">{row.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pesos(row.spent)} of {pesos(row.allocated)}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
