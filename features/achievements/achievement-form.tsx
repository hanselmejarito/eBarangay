"use client";

import { useActionState } from "react";
import { upsertAchievementAction } from "@/features/achievements/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";

export function AchievementForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    title?: string;
    description?: string;
    category?: string;
    awardedBy?: string | null;
    awardedAt?: string;
    publishedAt?: string;
    imageUrl?: string | null;
  };
}) {
  const [state, action] = useActionState(
    upsertAchievementAction.bind(null, id ?? null),
    {},
  );

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={defaults?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={6}
          defaultValue={defaults?.description}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Type</Label>
          <NativeSelect
            id="category"
            name="category"
            defaultValue={defaults?.category ?? "AWARD"}
            className="w-full"
          >
            <option value="AWARD">Award</option>
            <option value="CERTIFICATE">Certificate</option>
            <option value="RECOGNITION">Recognition</option>
            <option value="SEAL">Seal / accreditation</option>
            <option value="OTHER">Other</option>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="awardedBy">Awarded by</Label>
          <Input
            id="awardedBy"
            name="awardedBy"
            placeholder="DILG, City of Quezon, etc."
            defaultValue={defaults?.awardedBy ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="awardedAt">Date awarded</Label>
          <Input
            id="awardedAt"
            name="awardedAt"
            type="date"
            required
            defaultValue={defaults?.awardedAt}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Show on website from</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={defaults?.publishedAt}
          />
          <p className="text-xs text-muted-foreground">
            Future dates stay off the public awards list until that time.
          </p>
        </div>
      </div>
      <ImageField
        name="image"
        label="Photo of the certificate or award"
        existingUrl={defaults?.imageUrl}
      />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
