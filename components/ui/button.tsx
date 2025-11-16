import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Gold CTA - Primary action
        default: "bg-[rgb(var(--gold))] text-[rgb(var(--graphite))] hover:bg-[rgb(var(--gold))]/90 focus-visible:ring-[rgb(var(--gold))]/50 shadow-md hover:shadow-lg dark:text-white",

        // Destructive - Red accent
        destructive:
          "bg-[rgb(var(--legacy-red))] text-white hover:bg-[rgb(var(--legacy-red))]/90 focus-visible:ring-[rgb(var(--legacy-red))]/50 shadow-md",

        // Outline - Minimal with border
        outline:
          "border-2 border-[rgb(var(--legacy-grey))]/30 bg-transparent hover:bg-[rgb(var(--legacy-grey))]/5 hover:border-[rgb(var(--gold))] focus-visible:ring-[rgb(var(--gold))]/50",

        // Secondary - Blue for trust
        secondary:
          "bg-[rgb(var(--legacy-blue))] text-white hover:bg-[rgb(var(--legacy-blue))]/90 focus-visible:ring-[rgb(var(--legacy-blue))]/50 shadow-md",

        // Ghost - Minimal hover
        ghost:
          "hover:bg-[rgb(var(--legacy-grey))]/10 focus-visible:ring-[rgb(var(--gold))]/30",

        // Link
        link: "text-[rgb(var(--gold))] underline-offset-4 hover:underline hover:text-[rgb(var(--gold))]/80",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-4",
        sm: "h-9 px-4 gap-1.5 has-[>svg]:px-3 text-xs",
        lg: "h-12 px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
