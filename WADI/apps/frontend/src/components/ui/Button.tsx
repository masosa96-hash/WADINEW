import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--wadi-primary)] disabled:pointer-events-none disabled:opacity-50 font-mono-wadi uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--wadi-primary)] text-white shadow hover:bg-[var(--wadi-primary)]/90 hover:shadow-[0_0_15px_var(--wadi-primary-glow)]",
        destructive:
          "bg-[var(--wadi-alert)] text-white shadow-sm hover:bg-[var(--wadi-alert)]/90 hover:shadow-[0_0_15px_var(--wadi-alert-glow)]",
        outline:
          "border border-[var(--wadi-border)] bg-transparent shadow-sm hover:bg-[var(--wadi-surface)] hover:text-[var(--wadi-text)]",
        ghost: "hover:bg-[var(--wadi-surface)] hover:text-[var(--wadi-text)]",
        link: "text-[var(--wadi-primary)] underline-offset-4 hover:underline",
        glass:
          "wadi-glass hover:bg-[rgba(139,92,246,0.1)] text-[var(--wadi-primary)] border-[var(--wadi-primary)]/30",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-[2px]",
        md: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "sm",
    },
  }
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, radius, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
