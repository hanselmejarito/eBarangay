"use client";

import { useActionState } from "react";
import { createBudgetExpenseAction } from "@/features/budget/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";

export function BudgetExpenseForm({ lineId }: { lineId: string }) {
  const [state, action] = useActionState(createBudgetExpenseAction, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} success={state.success} />
      <input type="hidden" name="lineId" value={lineId} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="spentAt">Date</Label>
          <Input id="spentAt" name="spentAt" type="date" required defaultValue={today} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Amount (PHP)</Label>
          <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="payee">Payee / supplier</Label>
          <Input id="payee" name="payee" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="referenceNo">OR / DV / reference</Label>
          <Input id="referenceNo" name="referenceNo" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Particulars</Label>
        <Textarea id="description" name="description" required rows={2} />
      </div>
      <ImageField
        name="receipt"
        label="Receipt (photo or PDF, optional)"
        accept="image/jpeg,image/png,image/webp,application/pdf"
      />
      <SubmitButton>Record expense</SubmitButton>
    </form>
  );
}
