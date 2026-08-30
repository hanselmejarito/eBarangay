import Link from "next/link";
import { notFound } from "next/navigation";
import { HouseholdForm } from "@/features/households/household-form";
import { prisma } from "@/lib/prisma";
import { listHouseholdPeopleSql } from "@/lib/resident-sql";
import { formatResidentName, RELATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [household, people] = await Promise.all([
    prisma.household.findUnique({ where: { id } }),
    listHouseholdPeopleSql(id),
  ]);
  if (!household) notFound();

  const living = people.filter(
    (m) => m.residencyStatus === "ACTIVE" && m.lifeStatus === "ALIVE",
  );
  const members = living.filter((m) => m.relation === "MEMBER");
  const boarders = living.filter((m) => m.relation === "BOARDER");
  const former = people.filter((m) => m.residencyStatus === "MOVED_OUT" && m.lifeStatus === "ALIVE");
  const deceased = people.filter((m) => m.lifeStatus === "DECEASED");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">{household.householdNumber}</h1>
      <HouseholdForm
        id={household.id}
        defaults={{
          householdNumber: household.householdNumber,
          purok: household.purok,
          streetAddress: household.streetAddress,
          headResidentId: household.headResidentId,
        }}
        members={members.map((m) => ({
          id: m.id,
          name: formatResidentName(m),
        }))}
      />
      <MemberList title="Registered members" rows={members} />
      <MemberList title="Boarders / nakikitira" rows={boarders} empty="None staying as boarders." />
      <MemberList title="Former members (moved out)" rows={former} empty="No move-outs recorded." />
      <MemberList title="Deceased" rows={deceased} empty="No deaths recorded in this household." />
    </div>
  );
}

function MemberList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    suffix?: string | null;
    relation: "MEMBER" | "BOARDER";
    residencyStatus: "ACTIVE" | "MOVED_OUT";
    lifeStatus: "ALIVE" | "DECEASED";
  }[];
  empty?: string;
}) {
  return (
    <div>
      <h2 className="mb-2 font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty ?? "None."}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {rows.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <Link href={`/staff/residents/${m.id}`} className="text-primary">
                {formatResidentName(m)}
              </Link>
              <Badge variant="outline">{RELATION_LABELS[m.relation]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
