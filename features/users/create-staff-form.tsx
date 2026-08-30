"use client";

import { useActionState } from "react";
import { createStaffUserAction } from "@/features/users/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

export function CreateStaffForm() {
  const [state, action] = useActionState(createStaffUserAction, {});
  return (
    <form action={action} className="grid max-w-xl gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormMessage error={state.error} success={state.success} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Staff email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <NativeSelect id="role" name="role" className="w-full">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </NativeSelect>
      </div>
      <div className="flex items-end">
        <SubmitButton>Create staff account</SubmitButton>
      </div>
    </form>
  );
}
