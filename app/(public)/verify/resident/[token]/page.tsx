import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { parseSignedToken } from "@/lib/qr";
import { getSessionUser } from "@/lib/rbac";
import { getResidencyFields } from "@/lib/resident-sql";
import { formatResidentName, GENDER_LABELS, CIVIL_STATUS_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { StatusBadge } from "@/components/status-badge";
import { effectiveVoterStatus } from "@/lib/age";

export default async function VerifyResidentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const parsed = parseSignedToken(decodeURIComponent(token));
  if (!parsed || parsed.kind !== "resident") notFound();

  const resident = await prisma.resident.findUnique({
    where: { qrPublicId: parsed.id },
    include: { household: true },
  });
  if (!resident) notFound();

  const extras = await getResidencyFields(resident.id);
  const user = await getSessionUser();
  const isStaff = user?.role === "STAFF" || user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Resident verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isStaff && resident.photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl(resident.photoPath) ?? ""}
              alt=""
              className="mx-auto h-32 w-32 rounded-lg object-cover"
            />
          ) : null}
          <p className="text-2xl font-semibold">{formatResidentName(resident)}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={resident.verificationStatus} />
            {extras.lifeStatus === "DECEASED" ? (
              <Badge className="bg-zinc-800 text-white">Deceased</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {resident.household.purok} · Household {resident.household.householdNumber}
          </p>
          {isStaff ? (
            <div className="space-y-1 border-t pt-3 text-sm">
              <p>
                {GENDER_LABELS[resident.gender]} · {CIVIL_STATUS_LABELS[resident.civilStatus]}
              </p>
              <p>
                Born{" "}
                {resident.birthdate.toLocaleDateString("en-PH", { dateStyle: "long" })}
              </p>
              <p>{resident.household.streetAddress}</p>
              {resident.contactNumber ? <p>{resident.contactNumber}</p> : null}
              <div className="flex flex-wrap gap-2">
                {resident.isSenior ? <Badge>Senior</Badge> : null}
                {resident.isPwd ? <Badge>PWD</Badge> : null}
                {resident.isSoloParent ? <Badge>Solo parent</Badge> : null}
                {effectiveVoterStatus(extras, resident.birthdate).regular ? (
                  <Badge variant="outline">Regular voter</Badge>
                ) : null}
                {effectiveVoterStatus(extras, resident.birthdate).sk ? (
                  <Badge variant="outline">SK voter</Badge>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Limited public view. Sign in as staff to see the full record.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
