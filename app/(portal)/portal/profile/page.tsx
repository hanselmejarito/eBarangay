import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { getResidencyFields } from "@/lib/resident-sql";
import {
  CIVIL_STATUS_LABELS,
  formatResidentName,
  GENDER_LABELS,
  RELATION_LABELS,
  RESIDENCY_LABELS,
} from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { effectiveVoterStatus } from "@/lib/age";
import { ContactForm } from "@/features/residents/contact-form";

export default async function ProfilePage() {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  if (!me) {
    return <p>No resident profile is linked to this account.</p>;
  }
  const residency = await getResidencyFields(me.id);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Profile</h1>
      <Card>
      <CardHeader>
        <CardTitle>{formatResidentName(me)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {me.photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl(me.photoPath) ?? ""}
            alt=""
            className="h-28 w-28 rounded-lg border object-cover"
          />
        ) : null}
        <StatusBadge value={me.verificationStatus} />
        <p>
          {GENDER_LABELS[me.gender]} · {CIVIL_STATUS_LABELS[me.civilStatus]}
        </p>
        <p>
          Born {me.birthdate.toLocaleDateString("en-PH", { dateStyle: "long" })}
        </p>
        <p>{me.contactNumber}</p>
        <p>
          {me.household.streetAddress}, {me.household.purok}
        </p>
        <p>Household {me.household.householdNumber}</p>
        <p>
          {RELATION_LABELS[residency.relation]} · {RESIDENCY_LABELS[residency.residencyStatus]}
        </p>
        <div className="flex flex-wrap gap-2">
          {me.isSenior ? <Badge>Senior</Badge> : null}
          {me.isPwd ? <Badge>PWD</Badge> : null}
          {me.isSoloParent ? <Badge>Solo parent</Badge> : null}
          {effectiveVoterStatus(residency, me.birthdate).regular ? (
            <Badge variant="outline">Regular voter</Badge>
          ) : null}
          {effectiveVoterStatus(residency, me.birthdate).sk ? (
            <Badge variant="outline">SK voter</Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground">
          {user.email} ·{" "}
          <Link href="/portal/password" className="text-primary underline">
            Change password
          </Link>
        </p>
        <div className="border-t pt-4">
          <ContactForm contactNumber={me.contactNumber ?? ""} />
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
