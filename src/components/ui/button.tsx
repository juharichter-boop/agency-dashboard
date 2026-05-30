import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm font-medium text-sm whitespace-nowrap transition-smooth outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Primary: Desaturated green default, full green on hover */
        primary:
          "bg-accent-green text-text-primary hover:bg-neon-green hover:scale-102 active:translate-y-0.5 focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-bg-surface",

        /* Secondary: Electric blue, desaturated */
        secondary:
          "bg-accent-blue text-text-primary hover:bg-neon-blue hover:scale-102 active:translate-y-0.5 focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-bg-surface",

        /* Tertiary: Flat text, minimal background */
        tertiary:
          "text-text-primary hover:bg-bg-elevated transition-smooth active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-border-light focus:ring-offset-2 focus:ring-offset-bg-surface",

        /* Destructive: Soft red */
        destructive:
          "bg-accent-red text-text-primary hover:bg-neon-red hover:scale-102 active:translate-y-0.5 focus:ring-2 focus:ring-neon-red focus:ring-offset-2 focus:ring-offset-bg-surface",

        /* Ghost: No background, text only */
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/30 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-border-light",

        /* Link: Underlined text */
        link: "text-neon-green underline underline-offset-2 hover:text-neon-green/80 focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-bg-surface",
      },
      size: {
        xs: "h-6 px-2 text-xs gap-1",
        sm: "h-7 px-2.5 text-sm gap-1.5",
        default: "h-9 px-3.5 text-sm gap-2",
        lg: "h-10 px-4 text-base gap-2",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-lg": "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
