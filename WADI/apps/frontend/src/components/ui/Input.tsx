import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full bg-transparent border-b border-[var(--wadi-border)] px-3 py-1 text-base shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--wadi-text-muted)] focus-visible:outline-none focus-visible:border-[var(--wadi-primary)] focus-visible:shadow-[0_1px_0_0_var(--wadi-primary)] disabled:cursor-not-allowed disabled:opacity-50 rounded-none font-sans",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
