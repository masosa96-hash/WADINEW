import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "bottom",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs px-2 py-1 rounded shadow-lg transition-opacity duration-200 animate-in fade-in zoom-in-95 ${positionClasses[position]}`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-zinc-900 border-zinc-700 transform rotate-45 ${
              position === "top"
                ? "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r"
                : position === "bottom"
                  ? "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l"
                  : position === "left"
                    ? "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r"
                    : "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
}
