import * as React from "react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-9 min-w-0 rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs",
        "scheme-light dark:scheme-dark",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-card dark:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
