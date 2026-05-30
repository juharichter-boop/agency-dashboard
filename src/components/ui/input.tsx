import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full rounded-sm border border-border-subtle bg-bg-elevated px-3 py-2 text-base text-text-primary placeholder:text-text-muted transition-smooth outline-none",
        /* Focus state */
        "focus-visible:outline-none focus-visible:border-neon-green focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface focus-visible:shadow-md",
        /* Focus ring shadow with green glow */
        "focus-visible:[box-shadow:0_0_0_3px_rgba(155,224,0,0.2)]",
        /* Error state */
        "aria-invalid:border-neon-red aria-invalid:focus-visible:ring-neon-red aria-invalid:focus-visible:[box-shadow:0_0_0_3px_rgba(255,122,122,0.1)]",
        /* Disabled state */
        "disabled:cursor-not-allowed disabled:bg-bg-surface disabled:text-text-muted disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
