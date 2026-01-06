import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cit-gold disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-cit-navy text-white shadow-button hover:bg-[#003875] hover:shadow-card-hover",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border-2 border-cit-navy bg-white text-cit-navy shadow-sm hover:bg-cit-navy/5",
        secondary:
          "bg-cit-light text-cit-navy shadow-sm hover:bg-gray-200",
        ghost: "hover:bg-cit-navy/5 text-cit-navy",
        link: "text-cit-navy underline-offset-4 hover:underline",
        gold: "bg-cit-gold text-cit-navy shadow-button hover:bg-[#e5a617]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded px-3 text-xs",
        lg: "h-11 rounded px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
