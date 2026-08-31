import {
  markPaymentFormAction,
  updateRequestStatusFormAction,
} from "@/features/documents/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import type { RequestStatus } from "@prisma/client";

export function ProcessForm({
  id,
  status,
}: {
  id: string;
  status: RequestStatus;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <form action={updateRequestStatusFormAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REVIEWING" />
            <SubmitButton>Start review</SubmitButton>
          </form>
        ) : null}
        {status === "REVIEWING" || status === "PENDING" ? (
          <form action={updateRequestStatusFormAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="APPROVED" />
            <SubmitButton>Approve and issue</SubmitButton>
          </form>
        ) : null}
        {status === "APPROVED" ? (
          <form action={updateRequestStatusFormAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="RELEASED" />
            <SubmitButton>Mark released</SubmitButton>
          </form>
        ) : null}
        {status !== "REJECTED" && status !== "RELEASED" ? (
          <form action={updateRequestStatusFormAction} className="space-y-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REJECTED" />
            <Label htmlFor="rejectionReason">Rejection reason</Label>
            <Textarea id="rejectionReason" name="rejectionReason" required />
            <SubmitButton variant="destructive">Reject</SubmitButton>
          </form>
        ) : null}
      </div>
      <div className="flex gap-2">
        <form action={markPaymentFormAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="paid" value="true" />
          <SubmitButton variant="outline">Mark paid</SubmitButton>
        </form>
        <form action={markPaymentFormAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="paid" value="false" />
          <SubmitButton variant="ghost">Mark unpaid</SubmitButton>
        </form>
      </div>
    </div>
  );
}
