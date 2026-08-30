"use client";

import { useActionState } from "react";
import { upsertOfficialAction } from "@/features/officials/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";

export function OfficialForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    name?: string;
    role?: string;
    committee?: string | null;
    contactNumber?: string | null;
    sortOrder?: number;
    published?: boolean;
    photoUrl?: string | null;
  };
}) {
  const [state, action] = useActionState(
    upsertOfficialAction.bind(null, id ?? null),
    {},
  );

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Hon. Maria Santos"
          defaultValue={defaults?.name}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Position</Label>
          <NativeSelect
            id="role"
            name="role"
            className="w-full"
            defaultValue={defaults?.role ?? "BARANGAY_KAGAWAD"}
          >
            <option value="PUNONG_BARANGAY">Punong Barangay</option>
            <option value="BARANGAY_KAGAWAD">Barangay Kagawad</option>
            <option value="SECRETARY">Barangay Secretary</option>
            <option value="TREASURER">Barangay Treasurer</option>
            <option value="SK_CHAIRPERSON">SK Chairperson</option>
            <option value="SK_KAGAWAD">SK Kagawad</option>
            <option value="TANOD">Barangay Tanod</option>
            <option value="HEALTH_WORKER">Barangay Health Worker</option>
            <option value="OTHER">Other</option>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="committee">Committee / assignment</Label>
          <Input
            id="committee"
            name="committee"
            placeholder="Peace and Order, Health, etc."
            defaultValue={defaults?.committee ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact (optional)</Label>
          <Input
            id="contactNumber"
            name="contactNumber"
            defaultValue={defaults?.contactNumber ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Display order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={defaults?.sortOrder ?? 0}
          />
          <p className="text-xs text-muted-foreground">
            Lower number appears first. Leave 0 to use the default for the position.
          </p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaults?.published ?? true}
          className="size-4"
        />
        Show on the public website
      </label>
      <ImageField name="photo" label="Photo (optional)" existingUrl={defaults?.photoUrl} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
