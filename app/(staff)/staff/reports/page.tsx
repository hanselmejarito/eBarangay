import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { countActiveVerified, REGULAR_VOTER_SQL, SK_VOTER_SQL } from "@/lib/resident-sql";

const REPORTS = [
  { tag: "all", title: "All verified residents", description: "Living, verified residents" },
  { tag: "voter", title: "Regular voters", description: "COMELEC / barangay voters, 18+" },
  { tag: "sk", title: "SK voters", description: "Sangguniang Kabataan voters, ages 15–30" },
  { tag: "senior", title: "Senior citizens", description: "Residents tagged Senior" },
  { tag: "pwd", title: "PWD", description: "Residents tagged PWD" },
  { tag: "solo", title: "Solo parents", description: "Residents tagged Solo parent" },
  { tag: "deceased", title: "Deceased", description: "Recorded deaths — excluded from living counts" },
] as const;

export default async function ReportsPage() {
  await requireStaff();
  const [total, senior, pwd, solo, voter, sk, deceased] = await Promise.all([
    countActiveVerified(),
    countActiveVerified(Prisma.sql`AND "isSenior" = true`),
    countActiveVerified(Prisma.sql`AND "isPwd" = true`),
    countActiveVerified(Prisma.sql`AND "isSoloParent" = true`),
    countActiveVerified(REGULAR_VOTER_SQL),
    countActiveVerified(SK_VOTER_SQL),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Resident"
      WHERE "lifeStatus"::text = 'DECEASED'
    `.then((rows) => Number(rows[0]?.count ?? 0)),
  ]);

  const counts: Record<string, number> = {
    all: total,
    senior,
    pwd,
    solo,
    voter,
    sk,
    deceased,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Living residents only, except the deceased report. Download PDF for the hall or CSV for Excel.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        {REPORTS.map((r) => (
          <Card key={r.tag}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {r.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{counts[r.tag]}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" asChild>
                  <a href={`/api/reports/residents?tag=${r.tag}&format=pdf`}>PDF</a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/api/reports/residents?tag=${r.tag}&format=csv`}>CSV</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
