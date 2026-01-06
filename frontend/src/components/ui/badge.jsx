import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cit-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-cit-gold text-cit-navy",
        secondary:
          "bg-cit-light text-cit-navy",
        destructive:
          "bg-red-100 text-red-700",
        outline: "border border-cit-navy text-cit-navy",
        navy: "bg-cit-navy text-white",
        gold: "bg-cit-gold text-cit-navy",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
