import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ProcessForm } from "@/features/documents/process-form";
import { DocumentRequestForm } from "@/features/documents/request-form";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_LABELS, formatResidentName, pesos } from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { listEligibleDocumentSubjects } from "@/lib/resident-sql";

export default async function StaffRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const request = await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      subject: { include: { household: true } },
      certificate: true,
      requestedBy: { select: { email: true, role: true } },
    },
  });
  if (!request) notFound();

  const canEdit = request.status === "PENDING" || request.status === "REJECTED";
  const editing = canEdit && edit === "1";
  const subjects = editing
    ? await listEligibleDocumentSubjects({
        ids: [request.subjectResidentId],
        take: 1,
      })
    : [];
  const extra = editing
    ? await listEligibleDocumentSubjects({ take: 80 })
    : [];
  const byId = new Map(extra.map((m) => [m.id, m]));
  for (const row of subjects) byId.set(row.id, row);
  const members = [...byId.values()].map((m) => ({
    id: m.id,
    name: `${formatResidentName(m)} · ${m.householdNumber} · ${m.purok}`,
  }));
  if (!members.some((m) => m.id === request.subjectResidentId)) {
    members.unshift({
      id: request.subject.id,
      name: formatResidentName(request.subject),
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{DOCUMENT_LABELS[request.type]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <StatusBadge value={request.status} />
          {request.requestedBy.role !== "RESIDENT" ? (
            <p className="text-muted-foreground">
              Walk-in · filed by {request.requestedBy.email}
            </p>
          ) : null}
          <p>Resident: {formatResidentName(request.subject)}</p>
          <p>
            {request.subject.household.streetAddress}, {request.subject.household.purok}
          </p>
          <p>Purpose: {request.purpose}</p>
          {request.businessName ? (
            <p>
              Business: {request.businessName} ({request.businessNature}) —{" "}
              {request.businessAddress}
            </p>
          ) : null}
          <p>Fee: {pesos(request.feeAmount)}</p>
          <StatusBadge value={request.paymentStatus} />
          {request.controlNumber ? <p>Control no. {request.controlNumber}</p> : null}
          {request.rejectionReason ? (
            <p className="text-destructive">Reason: {request.rejectionReason}</p>
          ) : null}
          {request.certificate ? (
            <Button asChild>
              <a href={fileUrl(request.certificate.pdfPath) ?? "#"} target="_blank">
                Open certificate PDF
              </a>
            </Button>
          ) : null}
          {canEdit && !editing ? (
            <Button variant="outline" asChild>
              <Link href={`/staff/requests/${request.id}?edit=1`}>
                {request.status === "REJECTED" ? "Revise and resubmit" : "Update"}
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      {editing ? (
        <div className="space-y-2">
          <h2 className="font-semibold">
            {request.status === "REJECTED" ? "Revise and resubmit" : "Update request"}
          </h2>
          <DocumentRequestForm
            members={members}
            defaultSubjectId={request.subjectResidentId}
            requestId={request.id}
            defaults={{
              type: request.type,
              purpose: request.purpose,
              businessName: request.businessName,
              businessAddress: request.businessAddress,
              businessNature: request.businessNature,
            }}
            submitLabel={
              request.status === "REJECTED" ? "Revise and resubmit" : "Save changes"
            }
          />
        </div>
      ) : null}
      {request.status !== "REJECTED" ? (
        <ProcessForm id={request.id} status={request.status} />
      ) : null}
    </div>
  );
}
