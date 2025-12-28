import React from "react";

/**
 * WADI BUTTON
 * Estética Modern Dark.
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
      "bg-[var(--wadi-primary-glow)] border-[var(--wadi-primary)] text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary)] hover:text-white hover:shadow-[0_0_20px_var(--wadi-primary-dim)]",
    danger:
      "bg-red-900/20 border-[var(--wadi-red)] text-[var(--wadi-red)] hover:bg-[var(--wadi-red)] hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    ghost:
      "bg-transparent border-transparent text-gray-500 hover:text-[var(--wadi-text)]",
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
