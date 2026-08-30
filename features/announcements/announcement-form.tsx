"use client";

import { useActionState } from "react";
import { upsertAnnouncementAction } from "@/features/announcements/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";

export function AnnouncementForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    title?: string;
    content?: string;
    priority?: string;
    publishedAt?: string;
    expiresAt?: string;
    coverUrl?: string | null;
  };
}) {
  const [state, action] = useActionState(
    upsertAnnouncementAction.bind(null, id ?? null),
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
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" required rows={8} defaultValue={defaults?.content} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <NativeSelect
          id="priority"
          name="priority"
          defaultValue={defaults?.priority ?? "NORMAL"}
          className="w-full"
        >
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </NativeSelect>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Publish date</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={defaults?.publishedAt}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={defaults?.expiresAt}
          />
        </div>
      </div>
      <ImageField name="cover" label="Cover image" existingUrl={defaults?.coverUrl} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
