"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-orange-500 data-[state=on]:text-white",
  {
    variants: {
      variant: {
        default: "bg-transparent border border-gray-300",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100 hover:text-gray-900",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed = false, onPressedChange, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    />
  )
)
Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }
