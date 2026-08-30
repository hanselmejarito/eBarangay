import { notFound } from "next/navigation";
import { ResidentForm } from "@/features/residents/resident-form";
import { VerifyActions } from "@/features/residents/verify-actions";
import { prisma } from "@/lib/prisma";
import { getResidencyFields } from "@/lib/resident-sql";
import { fileUrl } from "@/lib/files";
import { formatResidentName } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { ResidencyActions } from "@/features/residents/residency-actions";
import { LIFE_STATUS_LABELS, RELATION_LABELS, RESIDENCY_LABELS } from "@/lib/constants";
import { effectiveVoterStatus, yearsOld } from "@/lib/age";

export default async function ResidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [resident, households, residency] = await Promise.all([
    prisma.resident.findUnique({
      where: { id },
      include: { household: true, user: true },
    }),
    prisma.household.findMany({
      orderBy: { householdNumber: "asc" },
      select: { id: true, householdNumber: true },
    }),
    getResidencyFields(id),
  ]);
  if (!resident) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">
          {formatResidentName(resident)}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge value={resident.verificationStatus} />
          <Badge variant="outline">{RELATION_LABELS[residency.relation]}</Badge>
          <Badge
            variant="secondary"
            className={
              residency.residencyStatus === "MOVED_OUT"
                ? "bg-red-100 text-red-800"
                : "bg-emerald-100 text-emerald-800"
            }
          >
            {RESIDENCY_LABELS[residency.residencyStatus]}
          </Badge>
          {residency.lifeStatus === "DECEASED" ? (
            <Badge className="bg-zinc-800 text-white">{LIFE_STATUS_LABELS.DECEASED}</Badge>
          ) : null}
          {effectiveVoterStatus(residency, resident.birthdate).regular ? (
            <Badge variant="outline">Regular voter</Badge>
          ) : null}
          {effectiveVoterStatus(residency, resident.birthdate).sk ? (
            <Badge variant="outline">SK voter</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Age {yearsOld(resident.birthdate)}
          {effectiveVoterStatus(residency, resident.birthdate).sk
            ? " · counted as SK voter (15–30)"
            : ""}
          {effectiveVoterStatus(residency, resident.birthdate).regular
            ? " · counted as regular voter (18+)"
            : ""}
        </p>
        {residency.movedOutAt ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Left {residency.movedOutAt.toLocaleDateString("en-PH")}
            {residency.movedOutNote ? ` · ${residency.movedOutNote}` : ""}
          </p>
        ) : null}
        {residency.deceasedAt ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Deceased {residency.deceasedAt.toLocaleDateString("en-PH")}
            {residency.deathNote ? ` · ${residency.deathNote}` : ""}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-4">
        {resident.photoPath ? (
          <a href={fileUrl(resident.photoPath) ?? "#"} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(resident.photoPath) ?? ""}
              alt={`${formatResidentName(resident)} photo`}
              className="h-32 w-32 rounded-lg border object-cover"
            />
          </a>
        ) : null}
        {resident.idDocumentPath ? (
          resident.idDocumentPath.endsWith(".pdf") ? (
            <a
              href={fileUrl(resident.idDocumentPath) ?? "#"}
              className="text-sm text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              View uploaded ID (PDF)
            </a>
          ) : (
            <a href={fileUrl(resident.idDocumentPath) ?? "#"} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl(resident.idDocumentPath) ?? ""}
                alt="Uploaded ID"
                className="h-32 rounded-lg border object-contain"
              />
            </a>
          )
        ) : null}
      </div>
      {resident.verificationStatus === "PENDING" ? (
        <VerifyActions id={resident.id} />
      ) : null}
      <ResidencyActions
        id={resident.id}
        currentHouseholdId={resident.householdId}
        households={households}
        movedOut={residency.residencyStatus === "MOVED_OUT"}
        deceased={residency.lifeStatus === "DECEASED"}
      />
      <ResidentForm
        residentId={resident.id}
        households={households}
        defaults={{
          firstName: resident.firstName,
          middleName: resident.middleName,
          lastName: resident.lastName,
          suffix: resident.suffix,
          birthdate: resident.birthdate.toISOString().slice(0, 10),
          gender: resident.gender,
          civilStatus: resident.civilStatus,
          contactNumber: resident.contactNumber,
          householdId: resident.householdId,
          isSenior: resident.isSenior,
          isPwd: resident.isPwd,
          isSoloParent: resident.isSoloParent,
          isRegisteredVoter: residency.isRegisteredVoter,
          isSkVoter: residency.isSkVoter,
          remarks: resident.remarks,
          photoUrl: fileUrl(resident.photoPath),
          relation: residency.relation,
        }}
      />
    </div>
  );
}
