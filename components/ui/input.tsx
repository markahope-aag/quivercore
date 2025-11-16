import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles - sophisticated, minimal
        "h-11 w-full rounded-sm border bg-white px-4 py-2.5 text-sm font-normal transition-all",
        "dark:bg-[rgb(var(--graphite))] dark:border-[rgb(var(--legacy-grey))]/20",

        // Border & shadow
        "border-[rgb(var(--legacy-grey))]/20 shadow-sm",

        // Typography
        "text-[rgb(var(--graphite))] dark:text-white",
        "placeholder:text-[rgb(var(--legacy-grey))]/50",

        // Focus state - gold accent
        "focus:outline-none focus:border-[rgb(var(--gold))] focus:ring-1 focus:ring-[rgb(var(--gold))]/20",
        "focus:shadow-[0_0_0_3px_rgba(184,151,89,0.08)]",

        // Selection
        "selection:bg-[rgb(var(--gold))]/20 selection:text-[rgb(var(--graphite))]",

        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",

        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",

        // Invalid state
        "aria-invalid:border-[rgb(var(--legacy-red))] aria-invalid:ring-[rgb(var(--legacy-red))]/20",

        className
      )}
      {...props}
    />
  )
}

export { Input }
