import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ProcessForm } from "@/features/documents/process-form";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_LABELS, formatResidentName, pesos } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.documentRequest.findUnique({
    where: { id },
    include: { subject: { include: { household: true } }, certificate: true },
  });
  if (!request) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{DOCUMENT_LABELS[request.type]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <StatusBadge value={request.status} />
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
          {request.certificate ? (
            <Button asChild>
              <a href={fileUrl(request.certificate.pdfPath) ?? "#"} target="_blank">
                Open certificate PDF
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <ProcessForm id={request.id} status={request.status} type={request.type} />
    </div>
  );
}
