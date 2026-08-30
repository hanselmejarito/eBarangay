import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { DOCUMENT_LABELS, formatResidentName, pesos } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

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

  return (
    <Card className="max-w-2xl">
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
        {request.certificate ? (
          <Button asChild>
            <a href={fileUrl(request.certificate.pdfPath) ?? "#"} target="_blank">
              Download certificate
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
