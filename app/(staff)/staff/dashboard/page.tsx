import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  BudgetCompareChart,
  DonutChart,
  HorizontalBarChart,
  MonthlyChart,
} from "@/features/dashboard/charts";
import { countActiveVerified, REGULAR_VOTER_SQL, SK_VOTER_SQL } from "@/lib/resident-sql";
import { listBudgetLines, yearBudgetTotals } from "@/lib/budget-sql";
import {
  BUDGET_CATEGORY_LABELS,
  COMPLAINT_CATEGORY_LABELS,
  DOCUMENT_LABELS,
  pesos,
  REQUEST_STATUS_LABELS,
} from "@/lib/constants";
import type { ComplaintCategory, DocumentType, RequestStatus } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWING: "#1d4ed8",
  APPROVED: "#0038a8",
  RELEASED: "#0f7a3a",
  REJECTED: "#ce1126",
};

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
    budgetLines,
    requestsByStatus,
    requestsByType,
    complaintsByCategory,
    residentsByPurok,
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
    listBudgetLines(now.getFullYear()),
    prisma.documentRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.documentRequest.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.complaint.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ name: string; value: number }[]>`
      SELECT h.purok AS name, COUNT(*)::int AS value
      FROM "Resident" r
      JOIN "Household" h ON h.id = r."householdId"
      WHERE r."verificationStatus"::text = 'VERIFIED'
        AND r."lifeStatus"::text = 'ALIVE'
        AND r."residencyStatus"::text = 'ACTIVE'
      GROUP BY h.purok
      ORDER BY COUNT(*) DESC, h.purok ASC
    `,
  ]);

  const byMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2000, i, 1).toLocaleString("en-PH", { month: "short" }),
    issued: monthly.filter((c) => c.issuedAt.getMonth() === i).length,
  }));

  const statusChart = (["PENDING", "REVIEWING", "APPROVED", "RELEASED", "REJECTED"] as RequestStatus[]).map(
    (status) => ({
      name: REQUEST_STATUS_LABELS[status],
      value: requestsByStatus.find((r) => r.status === status)?._count._all ?? 0,
      color: STATUS_COLORS[status],
    }),
  );

  const typeChart = (Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((type) => ({
    name: DOCUMENT_LABELS[type],
    value: requestsByType.find((r) => r.type === type)?._count._all ?? 0,
  }));

  const complaintChart = (Object.keys(COMPLAINT_CATEGORY_LABELS) as ComplaintCategory[]).map(
    (category) => ({
      name: COMPLAINT_CATEGORY_LABELS[category],
      value: complaintsByCategory.find((r) => r.category === category)?._count._all ?? 0,
    }),
  );

  const budgetByCategory = Object.entries(
    budgetLines.reduce<Record<string, { allocated: number; spent: number }>>((acc, line) => {
      const key = line.category;
      if (!acc[key]) acc[key] = { allocated: 0, spent: 0 };
      acc[key].allocated += line.allocated;
      acc[key].spent += line.spent;
      return acc;
    }, {}),
  ).map(([category, amounts]) => ({
    name: BUDGET_CATEGORY_LABELS[category] ?? category,
    allocated: amounts.allocated,
    spent: amounts.spent,
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
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Overview
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
              {s.value}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {sectors.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
              {s.value}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget allocated ({now.getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
            {pesos(budget.allocated)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget spent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
            {pesos(budget.spent)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums tracking-tight">
            {pesos(budget.remaining)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly certificates issued</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={byMonth} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Document requests by status</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusChart} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests by document type</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={typeChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Complaints by category</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={complaintChart} color="#ce1126" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verified residents by purok</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={residentsByPurok} color="#0f7a3a" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget by category ({now.getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetCompareChart data={budgetByCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
