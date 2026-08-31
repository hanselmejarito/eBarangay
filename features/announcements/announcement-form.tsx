"use client";

import { useActionState, useMemo, useState } from "react";
import { upsertAnnouncementAction } from "@/features/announcements/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";
import { announcementExpiresMin, toManilaDateTimeLocal } from "@/lib/datetime";

export function AnnouncementForm({
  id,
  defaults,
  liveEmail = false,
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
  liveEmail?: boolean;
}) {
  const [state, action] = useActionState(
    upsertAnnouncementAction.bind(null, id ?? null),
    {},
  );
  const nowLocal = useMemo(() => toManilaDateTimeLocal(new Date()), []);
  const [publishedAt, setPublishedAt] = useState(defaults?.publishedAt ?? nowLocal);
  const expiresMin = announcementExpiresMin(publishedAt, nowLocal);

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
          <Label htmlFor="publishedAt">Publish date (Philippine time)</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            required
            min={id ? undefined : nowLocal}
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Now or later. A future time schedules the notice — it stays off the
            homepage until then.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires (Philippine time)</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            min={expiresMin}
            defaultValue={defaults?.expiresAt}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Must be after the publish date.
          </p>
        </div>
      </div>
      <ImageField name="cover" label="Cover image" existingUrl={defaults?.coverUrl} />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="notifyResidents"
          defaultChecked={!id}
          className="mt-1 size-4"
        />
        <span>
          Notify verified residents by email
          <span className="mt-1 block text-xs text-muted-foreground">
            {liveEmail
              ? "Sends now to each verified resident’s login email (Resend), only if the publish date is already now or past. Scheduled notices are not emailed until you save again after they go live. Test sender only delivers to your Resend account Gmail until you verify a domain."
              : "Live Gmail is off — add RESEND_API_KEY to .env and restart the server."}
          </span>
        </span>
      </label>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
