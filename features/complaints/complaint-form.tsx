"use client";

import { useActionState } from "react";
import { createComplaintAction } from "@/features/complaints/actions";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";

export function ComplaintForm() {
  const [state, action] = useActionState(createComplaintAction, {});

  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <NativeSelect id="category" name="category" className="w-full">
          {Object.entries(COMPLAINT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={4} />
      </div>
      <ImageField name="photos" label="Photos (optional)" multiple />
      <SubmitButton>Submit</SubmitButton>
    </form>
  );
}
