import React from "react";
import type { Attachment } from "../store/chatStore";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  attachments?: Attachment[];
}

export function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex flex-col mb-4 w-full animate-enter ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[85%] p-5 rounded-2xl shadow-lg border text-[0.95rem] leading-7 transition-all duration-300 ${
          isUser
            ? "bg-[linear-gradient(135deg,rgba(139,92,246,0.1),rgba(139,92,246,0.05))] border-[var(--wadi-primary-dim)] text-[var(--wadi-text)] rounded-tr-sm backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)]"
            : "bg-[var(--wadi-surface-glass)] border-[var(--wadi-glass-border)] text-[var(--wadi-text-secondary)] rounded-tl-sm backdrop-blur-xl hover:border-[var(--wadi-border-hover)]"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div>
            {content.split(/(?=^#{1,3}\s)/m).map((block, i) => {
              // Simple markdown header parsing for WADI structure
              const match = block.match(/^(#{1,3})\s+(.+)(\r?\n|$)/);
              if (match) {
                const title = match[2].trim();
                const body = block.replace(match[0], "").trim();
                return (
                  <div key={i} className="mb-5 last:mb-0 group">
                    <div className="font-display font-semibold text-[1.1em] mb-2 text-[var(--wadi-text)] tracking-tight border-b border-[var(--wadi-primary-dim)] pb-1 w-fit group-hover:text-[var(--wadi-primary)] transition-colors">
                      {title}
                    </div>
                    <div className="whitespace-pre-wrap text-[var(--wadi-text-secondary)] font-light opacity-95">
                      {body}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="whitespace-pre-wrap leading-relaxed text-[var(--wadi-text-secondary)]"
                >
                  {block.trim()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {timestamp && (
        <span className="text-[10px] text-[var(--wadi-text-tertiary)] px-2 mt-1 font-medium tracking-wide">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
