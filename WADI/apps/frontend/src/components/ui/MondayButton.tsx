import React from "react";

/**
 * MONDAY OS v3.0 ATOMIC BUTTON
 * Estética Y2K Mate.
 */
interface MondayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
  label: string;
}

export const MondayButton: React.FC<MondayButtonProps> = ({
  variant = "primary",
  label,
  className = "",
  ...props
}) => {
  const baseStyle =
    "relative font-mono text-xs uppercase tracking-widest transition-all duration-200 border touch-min-44 px-6";

  const variants = {
    primary:
      "bg-[var(--monday-primary-glow)] border-[var(--monday-primary)] text-[var(--monday-primary)] hover:bg-[var(--monday-primary)] hover:text-white hover:shadow-[0_0_20px_var(--monday-primary-dim)]",
    danger:
      "bg-red-900/20 border-[var(--monday-red)] text-[var(--monday-red)] hover:bg-[var(--monday-red)] hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    ghost:
      "bg-transparent border-transparent text-gray-500 hover:text-[var(--monday-text)]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{label}</span>
      {/* Tech Corner Decoration */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50"></div>
    </button>
  );
};
