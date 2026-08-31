"use client";

import { useActionState } from "react";
import { updateUserAccountAction } from "@/features/users/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function EditUserForm({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
  const [state, action] = useActionState(
    updateUserAccountAction.bind(null, id),
    {},
  );

  return (
    <form action={action} className="max-w-md space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="email">Login email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={email}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Leave blank to keep the current password"
        />
        <p className="text-xs text-muted-foreground">
          Optional. At least 8 characters, one uppercase letter, and one number.
          The user will be signed out and must use the new password.
        </p>
      </div>
      <SubmitButton>Save account</SubmitButton>
    </form>
  );
}
