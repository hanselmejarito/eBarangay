"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { FormMessage } from "@/components/form-message";
import type { ActionState } from "@/features/auth/actions";

export function FeedbackForm({
  action,
  children,
  className,
  showMessage = false,
}: {
  action: (formData: FormData) => Promise<ActionState | void>;
  children: React.ReactNode;
  className?: string;
  showMessage?: boolean;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const result = (await action(formData)) ?? { success: "Saved." };
      if (result.error) toast.error(result.error);
      if (result.success) toast.success(result.success);
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className={className}>
      {showMessage ? (
        <FormMessage error={state.error} success={state.success} silent />
      ) : null}
      {children}
    </form>
  );
}
