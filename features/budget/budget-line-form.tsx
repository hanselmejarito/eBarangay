"use client";

import { useActionState } from "react";
import { upsertBudgetLineAction } from "@/features/budget/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

export function BudgetLineForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    year?: number;
    category?: string;
    title?: string;
    allocated?: number;
    notes?: string | null;
  };
}) {
  const [state, action] = useActionState(
    upsertBudgetLineAction.bind(null, id ?? null),
    {},
  );
  const year = defaults?.year ?? new Date().getFullYear();

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" required defaultValue={year} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <NativeSelect
            id="category"
            name="category"
            className="w-full"
            defaultValue={defaults?.category ?? "MOOE"}
          >
            <option value="PERSONAL_SERVICES">Personal services</option>
            <option value="MOOE">MOOE</option>
            <option value="CAPITAL_OUTLAY">Capital outlay</option>
            <option value="SK_FUND">SK fund</option>
            <option value="GAD">GAD</option>
            <option value="CALAMITY">Calamity / DRRM</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="PEACE_AND_ORDER">Peace and order</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Allocation title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Office supplies"
          defaultValue={defaults?.title}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allocated">Allocated amount (PHP)</Label>
        <Input
          id="allocated"
          name="allocated"
          type="number"
          min={0}
          step="0.01"
          required
          defaultValue={defaults?.allocated ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} />
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
