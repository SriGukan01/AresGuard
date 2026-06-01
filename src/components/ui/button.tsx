import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border-2 border-border bg-transparent hover:bg-secondary hover:border-muted-foreground/30 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
        emergency:
          "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/40 hover:opacity-90 active:scale-[0.98] animate-pulse",
        success:
          "bg-green-600 text-white hover:bg-green-600/90 active:scale-[0.98]",
        warning:
          "bg-amber-500 text-black hover:bg-amber-500/90 active:scale-[0.98]",
        sos:
          "bg-gradient-to-r from-red-600 to-red-500 text-white text-2xl font-bold tracking-wide shadow-lg shadow-red-500/40 hover:opacity-95 active:scale-[0.97] uppercase",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-xl px-10 text-lg",
        xxl: "h-20 rounded-2xl px-12 text-xl",
        icon: "h-11 w-11",
        "icon-lg": "h-14 w-14",
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
