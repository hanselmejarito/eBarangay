"use client";

import { useActionState } from "react";
import {
  markPaymentFormAction,
  updateRequestStatusFormAction,
} from "@/features/documents/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import type { RequestStatus } from "@prisma/client";

export function ProcessForm({
  id,
  status,
}: {
  id: string;
  status: RequestStatus;
}) {
  const [statusState, statusAction] = useActionState(updateRequestStatusFormAction, {});
  const [paymentState, paymentAction] = useActionState(markPaymentFormAction, {});

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <FormMessage error={statusState.error} success={statusState.success} />
      <FormMessage error={paymentState.error} success={paymentState.success} />
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <form action={statusAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REVIEWING" />
            <SubmitButton>Start review</SubmitButton>
          </form>
        ) : null}
        {status === "REVIEWING" || status === "PENDING" ? (
          <form action={statusAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="APPROVED" />
            <SubmitButton>Approve and issue</SubmitButton>
          </form>
        ) : null}
        {status === "APPROVED" ? (
          <form action={statusAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="RELEASED" />
            <SubmitButton>Mark released</SubmitButton>
          </form>
        ) : null}
        {status !== "REJECTED" && status !== "RELEASED" ? (
          <form action={statusAction} className="space-y-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REJECTED" />
            <Label htmlFor="rejectionReason">Rejection reason</Label>
            <Textarea id="rejectionReason" name="rejectionReason" required />
            <SubmitButton variant="destructive">Reject</SubmitButton>
          </form>
        ) : null}
      </div>
      <div className="flex gap-2">
        <form action={paymentAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="paid" value="true" />
          <SubmitButton variant="outline">Mark paid</SubmitButton>
        </form>
        <form action={paymentAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="paid" value="false" />
          <SubmitButton variant="ghost">Mark unpaid</SubmitButton>
        </form>
      </div>
    </div>
  );
}
