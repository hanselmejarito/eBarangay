"use client";

import { useActionState } from "react";
import {
  createHouseholdAction,
  updateHouseholdAction,
} from "@/features/households/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

export function HouseholdForm({
  id,
  defaults,
  members,
}: {
  id?: string;
  defaults?: {
    householdNumber?: string;
    purok?: string;
    streetAddress?: string;
    headResidentId?: string | null;
  };
  members?: { id: string; name: string }[];
}) {
  const action = id ? updateHouseholdAction.bind(null, id) : createHouseholdAction;
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="householdNumber">Household number</Label>
        <Input
          id="householdNumber"
          name="householdNumber"
          required
          defaultValue={defaults?.householdNumber}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purok">Purok / sitio</Label>
        <Input id="purok" name="purok" required defaultValue={defaults?.purok} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street address</Label>
        <Input
          id="streetAddress"
          name="streetAddress"
          required
          defaultValue={defaults?.streetAddress}
        />
      </div>
      {members ? (
        <div className="space-y-2">
          <Label htmlFor="headResidentId">Household head</Label>
          <NativeSelect
            id="headResidentId"
            name="headResidentId"
            defaultValue={defaults?.headResidentId ?? ""}
            className="w-full"
          >
            <option value="">None</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}
      <SubmitButton>{id ? "Save" : "Create household"}</SubmitButton>
    </form>
  );
}
