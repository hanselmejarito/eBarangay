import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { parseSignedToken } from "@/lib/qr";
import { DOCUMENT_LABELS, formatResidentName } from "@/lib/constants";
import { formatManilaDate } from "@/lib/datetime";
import { StatusBadge } from "@/components/status-badge";
import { fileUrl } from "@/lib/files";
import { Button } from "@/components/ui/button";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const parsed = parseSignedToken(decodeURIComponent(token));
  if (!parsed || parsed.kind !== "certificate") notFound();

  const request = await prisma.documentRequest.findUnique({
    where: { id: parsed.id },
    include: {
      subject: { include: { household: true } },
      certificate: true,
    },
  });
  if (!request?.certificate) notFound();

  const expired = request.certificate.validUntil < new Date();

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Certificate verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-lg font-semibold">{DOCUMENT_LABELS[request.type]}</p>
          <p>Control no. {request.controlNumber}</p>
          <p>Issued to {formatResidentName(request.subject)}</p>
          <p>
            Valid until {formatManilaDate(request.certificate.validUntil)}
            {expired ? " — expired" : ""}
          </p>
          <StatusBadge value={request.status} />
          {request.certificate.pdfPath ? (
            <Button asChild className="mt-4">
              <a href={fileUrl(request.certificate.pdfPath) ?? "#"} target="_blank">
                Open PDF
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
