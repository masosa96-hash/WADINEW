import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, style, ...props }, ref) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: fullWidth ? "100%" : "auto",
        }}
      >
        {label && (
          <label
            style={{
              marginBottom: "var(--space-1)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            backgroundColor: "var(--bg-app)",
            border: error
              ? "1px solid var(--error)"
              : "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "1rem",
            outline: "none",
            transition: "border-color 0.2s",
            ...style,
          }}
          onFocus={(e) => {
            if (!error)
              e.currentTarget.style.borderColor = "var(--border-focus)";
          }}
          onBlur={(e) => {
            if (!error)
              e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
          {...props}
        />
        {error && (
          <span
            style={{
              color: "var(--error)",
              fontSize: "0.8rem",
              marginTop: "4px",
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
