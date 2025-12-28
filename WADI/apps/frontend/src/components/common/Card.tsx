import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
          cursor: hoverable ? "pointer" : "default",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (hoverable) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }
        }}
        onMouseLeave={(e) => {
          if (hoverable) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
