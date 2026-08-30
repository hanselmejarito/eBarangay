"use client";

import { useActionState } from "react";
import { upsertInventoryItemAction } from "@/features/inventory/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

export function InventoryForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    name?: string;
    category?: string;
    quantity?: number;
    quantityOut?: number;
    condition?: string;
    location?: string | null;
    propertyNumber?: string | null;
    notes?: string | null;
  };
}) {
  const [state, action] = useActionState(
    upsertInventoryItemAction.bind(null, id ?? null),
    {},
  );

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="name">Item name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Monoblock chairs"
          defaultValue={defaults?.name}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <NativeSelect
            id="category"
            name="category"
            className="w-full"
            defaultValue={defaults?.category ?? "FURNITURE"}
          >
            <option value="FURNITURE">Furniture</option>
            <option value="EVENT">Event / tents</option>
            <option value="AUDIO_VISUAL">Sound / lights</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="COMMUNICATION">Radio / comms</option>
            <option value="DISASTER">Disaster / rescue</option>
            <option value="SPORTS">Sports</option>
            <option value="OFFICE">Office</option>
            <option value="OTHER">Other</option>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <NativeSelect
            id="condition"
            name="condition"
            className="w-full"
            defaultValue={defaults?.condition ?? "GOOD"}
          >
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="NEEDS_REPAIR">Needs repair</option>
            <option value="UNUSABLE">Unusable</option>
          </NativeSelect>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Total quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            required
            defaultValue={defaults?.quantity ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantityOut">Currently borrowed / out</Label>
          <Input
            id="quantityOut"
            name="quantityOut"
            type="number"
            min={0}
            defaultValue={defaults?.quantityOut ?? 0}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Storage / location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Hall storage room"
            defaultValue={defaults?.location ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyNumber">Property no. (optional)</Label>
          <Input
            id="propertyNumber"
            name="propertyNumber"
            placeholder="BRGY-2024-001"
            defaultValue={defaults?.propertyNumber ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Who borrowed a set, serial number, etc."
          defaultValue={defaults?.notes ?? ""}
        />
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
