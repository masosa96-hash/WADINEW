import React, { ReactNode } from "react";

interface MondayCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const MondayCard: React.FC<MondayCardProps> = ({
  children,
  className = "",
  title,
}) => {
  return (
    <div className={`monday-card flex flex-col ${className}`}>
      {title && (
        <div className="absolute top-0 left-0 bg-[var(--monday-primary)] text-black px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
