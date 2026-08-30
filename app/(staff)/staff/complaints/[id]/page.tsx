import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { updateComplaintStatusFormAction } from "@/features/complaints/actions";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { COMPLAINT_CATEGORY_LABELS, formatResidentName } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function StaffComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { reportedBy: { include: { resident: true } } },
  });
  if (!complaint) notFound();
  const reporter = complaint.reportedBy.resident
    ? formatResidentName(complaint.reportedBy.resident)
    : complaint.reportedBy.email;

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{COMPLAINT_CATEGORY_LABELS[complaint.category]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <StatusBadge value={complaint.status} />
          <p>Reported by {reporter}</p>
          <p>Location: {complaint.location}</p>
          <p className="whitespace-pre-wrap">{complaint.description}</p>
          <div className="flex flex-wrap gap-2">
            {complaint.photoPaths.map((p) => (
              <a key={p} href={fileUrl(p) ?? "#"} target="_blank">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl(p) ?? ""} alt="" className="h-24 w-24 rounded object-cover" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <form action={updateComplaintStatusFormAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="IN_PROGRESS" />
          <SubmitButton>Mark in progress</SubmitButton>
        </form>
        <form action={updateComplaintStatusFormAction} className="space-y-2">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="RESOLVED" />
          <Label htmlFor="resolutionNotes">Resolution notes</Label>
          <Textarea id="resolutionNotes" name="resolutionNotes" />
          <SubmitButton>Resolve</SubmitButton>
        </form>
      </div>
    </div>
  );
}
