import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { MonthlyChart } from "@/features/dashboard/monthly-chart";
import { countActiveVerified, REGULAR_VOTER_SQL, SK_VOTER_SQL } from "@/lib/resident-sql";
import { yearBudgetTotals } from "@/lib/budget-sql";
import { pesos } from "@/lib/constants";

export default async function DashboardPage() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    residents,
    households,
    pendingRequests,
    activeComplaints,
    issuedThisMonth,
    monthly,
    seniors,
    pwds,
    soloParents,
    regularVoters,
    skVoters,
    budget,
  ] = await Promise.all([
    countActiveVerified(),
    prisma.household.count(),
    prisma.documentRequest.count({
      where: { status: { in: ["PENDING", "REVIEWING"] } },
    }),
    prisma.complaint.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.certificate.count({
      where: {
        issuedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    }),
    prisma.certificate.findMany({
      where: { issuedAt: { gte: startOfYear } },
      select: { issuedAt: true },
    }),
    countActiveVerified(Prisma.sql`AND "isSenior" = true`),
    countActiveVerified(Prisma.sql`AND "isPwd" = true`),
    countActiveVerified(Prisma.sql`AND "isSoloParent" = true`),
    countActiveVerified(REGULAR_VOTER_SQL),
    countActiveVerified(SK_VOTER_SQL),
    yearBudgetTotals(now.getFullYear()),
  ]);

  const byMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2000, i, 1).toLocaleString("en-PH", { month: "short" }),
    issued: monthly.filter((c) => c.issuedAt.getMonth() === i).length,
  }));

  const stats = [
    { label: "Verified residents", value: residents },
    { label: "Households", value: households },
    { label: "Pending requests", value: pendingRequests },
    { label: "Active complaints", value: activeComplaints },
    { label: "Certificates this month", value: issuedThisMonth },
  ];

  const sectors = [
    { label: "Senior citizens", value: seniors },
    { label: "PWD", value: pwds },
    { label: "Solo parents", value: soloParents },
    { label: "Regular voters (18+)", value: regularVoters },
    { label: "SK voters (15–30)", value: skVoters },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{s.value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {sectors.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{s.value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget allocated ({now.getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pesos(budget.allocated)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget spent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pesos(budget.spent)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pesos(budget.remaining)}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly certificates issued</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart data={byMonth} />
        </CardContent>
      </Card>
    </div>
  );
}
