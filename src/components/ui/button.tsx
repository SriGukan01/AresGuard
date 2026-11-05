import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-sm",
        emergency:
          "bg-destructive text-destructive-foreground hover:bg-[#a8222a] active:bg-[#8f1a21] shadow-sm font-bold tracking-wide",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/95 shadow-sm",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted/60 hover:text-foreground active:bg-muted shadow-xs",
        ghost:
          "text-foreground hover:bg-muted/70 hover:text-foreground active:bg-muted",
        link:
          "text-secondary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground hover:bg-success/90 active:bg-success/95 shadow-sm",
        warning:
          "bg-warning text-white hover:bg-warning/90 active:bg-warning/95 shadow-sm",
        sos:
          "bg-destructive text-destructive-foreground font-black tracking-wider uppercase hover:bg-[#a8222a] active:scale-[0.98] shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base",
        xl: "h-14 rounded-lg px-8 text-base",
        xxl: "h-16 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };