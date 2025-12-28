import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      style,
      ...props
    },
    ref
  ) => {
    let bg = "var(--accent-primary)";
    let color = "var(--accent-text)";
    let border = "none";
    let padding = "var(--space-2) var(--space-4)";
    let fontSize = "1rem";

    if (variant === "secondary") {
      bg = "var(--bg-element)";
      color = "var(--text-primary)";
    } else if (variant === "outline") {
      bg = "transparent";
      border = "1px solid var(--border-subtle)";
      color = "var(--text-primary)";
    } else if (variant === "ghost") {
      bg = "transparent";
      color = "var(--text-secondary)";
    } else if (variant === "danger") {
      bg = "transparent";
      color = "var(--error)";
      border = "1px solid var(--error)";
    }

    if (size === "sm") {
      padding = "var(--space-1) var(--space-3)";
      fontSize = "0.875rem";
    } else if (size === "lg") {
      padding = "var(--space-3) var(--space-5)";
      fontSize = "1.125rem";
    }

    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      fontWeight: 500,
      cursor: props.disabled ? "not-allowed" : "pointer",
      opacity: props.disabled ? 0.6 : 1,
      transition: "all 0.2s ease",
      backgroundColor: bg,
      color: color,
      border: border,
      padding: padding,
      fontSize: fontSize,
      width: fullWidth ? "100%" : "auto",
      ...style,
    };

    return (
      <button
        ref={ref}
        className={className}
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!props.disabled && variant === "primary") {
            e.currentTarget.style.backgroundColor =
              "var(--accent-primary-hover)";
          }
          if (!props.disabled && variant === "outline") {
            e.currentTarget.style.borderColor = "var(--border-focus)";
          }
        }}
        onMouseLeave={(e) => {
          if (!props.disabled && variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--accent-primary)";
          }
          if (!props.disabled && variant === "outline") {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }
        }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
