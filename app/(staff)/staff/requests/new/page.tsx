import Link from "next/link";
import { DocumentRequestForm } from "@/features/documents/request-form";
import { requireStaff } from "@/lib/rbac";
import { listEligibleDocumentSubjects } from "@/lib/resident-sql";
import { formatResidentName } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default async function StaffWalkInRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; residentId?: string }>;
}) {
  await requireStaff();
  const { q, residentId } = await searchParams;

  const [matches, preselected] = await Promise.all([
    listEligibleDocumentSubjects({ q, take: 80 }),
    residentId
      ? listEligibleDocumentSubjects({ ids: [residentId], take: 1 })
      : Promise.resolve([]),
  ]);

  const byId = new Map(matches.map((m) => [m.id, m]));
  for (const row of preselected) byId.set(row.id, row);
  const subjects = [...byId.values()].sort((a, b) =>
    formatResidentName(a).localeCompare(formatResidentName(b), "en"),
  );

  const members = subjects.map((m) => ({
    id: m.id,
    name: `${formatResidentName(m)} · ${m.householdNumber} · ${m.purok}`,
  }));
  const defaultSubjectId = residentId && byId.has(residentId) ? residentId : members[0]?.id;

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Walk-in request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          File a certificate at the hall for a verified resident who is here in
          person. They do not need a portal account.
        </p>
      </div>
      <form className="flex flex-wrap gap-2">
        <Input
          name="q"
          placeholder="Search name or household"
          defaultValue={q}
          className="max-w-xs"
        />
        {residentId ? <input type="hidden" name="residentId" value={residentId} /> : null}
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {members.length === 0 ? (
        <EmptyState
          title="No eligible resident"
          description="The person must be verified, living here, and not deceased. Add or verify them first."
          action={
            <Button asChild>
              <Link href="/staff/residents/new">Add resident</Link>
            </Button>
          }
        />
      ) : (
        <DocumentRequestForm
          members={members}
          defaultSubjectId={defaultSubjectId}
          walkIn
          submitLabel="Create walk-in request"
        />
      )}
      <Button variant="outline" asChild>
        <Link href="/staff/requests">Back to requests</Link>
      </Button>
    </div>
  );
}
