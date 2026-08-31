"use client";

import { useActionState } from "react";
import { updateMyContactAction } from "@/features/residents/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function ContactForm({ contactNumber }: { contactNumber: string }) {
  const [state, action] = useActionState(updateMyContactAction, {});
  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Mobile number</Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          defaultValue={contactNumber}
          placeholder="09XXXXXXXXX"
          required
        />
        <p className="text-xs text-muted-foreground">
          Used for announcement SMS. Your login email is used for email notices.
        </p>
      </div>
      <SubmitButton>Save contact</SubmitButton>
    </form>
  );
}
