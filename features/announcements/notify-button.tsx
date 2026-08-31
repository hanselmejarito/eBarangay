"use client";

import { useActionState } from "react";
import { sendAnnouncementNoticesAction } from "@/features/announcements/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function NotifyResidentsButton({ id }: { id: string }) {
  const [state, action] = useActionState(
    async (_prev: { error?: string; success?: string }) =>
      sendAnnouncementNoticesAction(id),
    {},
  );

  return (
    <form action={action} className="space-y-2">
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton>Notify residents now</SubmitButton>
    </form>
  );
}
