"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Added for the moderation queue's multi-select. Sized to the 16px box the kit
 * uses for dense rows, with the same focus ring as `Switch` so the two read as
 * one family.
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-border-dark outline-none transition-[background-color,border-color,box-shadow]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? <Minus className="size-3" /> : <Check className="size-3" />}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
