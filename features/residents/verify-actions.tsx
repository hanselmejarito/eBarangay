import { verifyResidentFormAction } from "@/features/residents/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FeedbackForm } from "@/components/feedback-form";

export function VerifyActions({ id }: { id: string }) {
  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      <FeedbackForm action={verifyResidentFormAction} showMessage>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="VERIFIED" />
        <SubmitButton>Verify resident</SubmitButton>
      </FeedbackForm>
      <FeedbackForm action={verifyResidentFormAction} className="space-y-2" showMessage>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="REJECTED" />
        <Label htmlFor="rejectionReason">Rejection reason</Label>
        <Textarea id="rejectionReason" name="rejectionReason" required />
        <SubmitButton variant="destructive">Reject</SubmitButton>
      </FeedbackForm>
    </div>
  );
}
