"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function FormMessage({
  error,
  success,
  silent = false,
}: {
  error?: string;
  success?: string;
  silent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const message = error ?? success;

  useEffect(() => {
    if (!message) return;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (silent) return;
    if (error) toast.error(error);
    if (success) toast.success(success);
  }, [error, success, message, silent]);

  if (!message) return null;

  return (
    <div ref={ref}>
      <Alert
        variant={error ? "destructive" : "default"}
        className={cn(
          "items-center",
          error
            ? "border-destructive/40 bg-red-50 text-destructive dark:bg-red-950/40"
            : "border-emerald-300/80 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
        )}
      >
        {error ? (
          <CircleAlert className="size-4" />
        ) : (
          <CircleCheck className="size-4 text-emerald-700 dark:text-emerald-300" />
        )}
        <AlertDescription
          className={cn(
            "font-medium",
            error ? "text-destructive" : "text-emerald-900 dark:text-emerald-100",
          )}
        >
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
