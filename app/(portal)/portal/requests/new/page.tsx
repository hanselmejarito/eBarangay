import { redirect } from "next/navigation";
import { DocumentRequestForm } from "@/features/documents/request-form";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { listActiveVerifiedHouseholdMembers } from "@/lib/resident-sql";
import { formatResidentName } from "@/lib/constants";

export default async function NewRequestPage() {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  if (!me || me.verificationStatus !== "VERIFIED") {
    redirect("/portal");
  }

  const members = await listActiveVerifiedHouseholdMembers(me.householdId);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-serif text-2xl font-semibold">New document request</h1>
      <DocumentRequestForm
        members={members.map((m) => ({
          id: m.id,
          name: formatResidentName(m),
        }))}
        defaultSubjectId={me.id}
      />
    </div>
  );
}
