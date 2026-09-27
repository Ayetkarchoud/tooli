import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

// tooli look: Poppins semibold, 10px corners (12px for lg), colours from our tokens.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap no-underline transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_86%,var(--foreground))]",
        outline:
          "bg-transparent text-foreground inset-ring-[1.5px] inset-ring-border hover:bg-accent hover:inset-ring-primary aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_5%)]",
        ghost:
          "text-foreground hover:bg-accent aria-expanded:bg-accent",
        // amber accent button (Go VIP)
        highlight: "bg-highlight text-highlight-foreground hover:bg-[color-mix(in_srgb,var(--color-accent)_86%,var(--foreground))]",
        // small rounded outline pill (Resume, New tip, suggestion chips)
        pill: "rounded-full border-border bg-transparent text-foreground hover:border-primary hover:bg-accent",
        // square icon button with a border (top bar)
        tile: "rounded-lg border-border bg-background text-foreground hover:bg-accent",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-[18px]",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 rounded-lg px-6 text-[15px]",
        icon: "size-[38px]",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-[42px] rounded-lg",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
