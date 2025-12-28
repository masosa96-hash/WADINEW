import { FileText } from "lucide-react";
import type { HTMLAttributes } from "react";

interface LogItemProps extends HTMLAttributes<HTMLDivElement> {
  date: string;
  title: string;
  isActive?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
  onReport?: (e: React.MouseEvent) => void;
}

export function LogItem({
  date,
  title,
  isActive,
  onDelete,
  onReport,
  onClick,
  className,
}: LogItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
            group relative flex items-center justify-between
            px-4 py-2 cursor-pointer transition-all duration-150
            border-l-2 select-none
            ${
              isActive
                ? "bg-[var(--wadi-surface)] border-[var(--wadi-primary)] text-[var(--wadi-text)]"
                : "border-transparent text-[var(--wadi-text-muted)] hover:bg-[var(--wadi-surface)] hover:text-[var(--wadi-text)] hover:border-[var(--wadi-border)]"
            }
            ${className || ""}
            `}
    >
      <div className="flex items-baseline gap-2 overflow-hidden font-mono-wadi text-[11px] w-full">
        <span className="opacity-50 shrink-0">[{date}]</span>
        <span className="truncate opacity-90 uppercase tracking-tight">
          {title}
        </span>
      </div>

      {onReport && (
        <button
          onClick={onReport}
          className="absolute right-8 opacity-0 group-hover:opacity-100 hover:text-[var(--wadi-primary)] transition-opacity mr-2"
          title="Audit Report"
        >
          <FileText size={14} />
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-[var(--wadi-alert)] transition-opacity"
          title="Purge Log"
        >
          ✕
        </button>
      )}
    </div>
  );
}
