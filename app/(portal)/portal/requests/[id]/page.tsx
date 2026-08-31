import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { DOCUMENT_LABELS, formatResidentName, pesos } from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { listActiveVerifiedHouseholdMembers } from "@/lib/resident-sql";
import { DocumentRequestForm } from "@/features/documents/request-form";

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const request = await prisma.documentRequest.findUnique({
    where: { id },
    include: { subject: true, certificate: true },
  });
  if (!request || request.requestedByUserId !== user.id) notFound();

  const me = await getResidentContext(user.id);
  const members = me
    ? await listActiveVerifiedHouseholdMembers(me.householdId)
    : [];
  const memberOptions = members.map((m) => ({
    id: m.id,
    name: formatResidentName(m),
  }));
  if (!memberOptions.some((m) => m.id === request.subjectResidentId)) {
    memberOptions.unshift({
      id: request.subject.id,
      name: formatResidentName(request.subject),
    });
  }

  const canEdit = request.status === "PENDING" || request.status === "REJECTED";

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{DOCUMENT_LABELS[request.type]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <StatusBadge value={request.status} />
          <p>For {formatResidentName(request.subject)}</p>
          <p>Purpose: {request.purpose}</p>
          <p>Fee: {pesos(request.feeAmount)}</p>
          <StatusBadge value={request.paymentStatus} />
          {request.controlNumber ? <p>Control no. {request.controlNumber}</p> : null}
          {request.rejectionReason ? (
            <p className="text-destructive">Reason: {request.rejectionReason}</p>
          ) : null}
          {request.status === "REVIEWING" ? (
            <p className="text-muted-foreground">
              The hall is reviewing this request. It cannot be edited until they
              finish or reject it.
            </p>
          ) : null}
          {request.certificate ? (
            <Button asChild>
              <a href={fileUrl(request.certificate.pdfPath) ?? "#"} target="_blank">
                Download certificate
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      {canEdit ? (
        <div className="space-y-2">
          <h2 className="font-semibold">
            {request.status === "REJECTED" ? "Revise and resubmit" : "Update request"}
          </h2>
          {request.status === "REJECTED" ? (
            <p className="text-sm text-muted-foreground">
              Fix the details below and send it back to the hall. The rejection
              reason stays on record.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can change this while it is still pending.
            </p>
          )}
          <DocumentRequestForm
            members={memberOptions}
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
    </div>
  );
}
