import type { Attachment } from "../store/chatStore";
import { Paperclip as AttachmentIcon } from "lucide-react";

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
  attachments,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] md:max-w-[75%] px-4 py-3 border transition-colors ${
          !isUser
            ? "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)]"
            : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
        }`}
      >
        {/* Role Identifier */}
        <span className="text-[10px] uppercase tracking-widest font-mono text-[var(--text-muted)] block mb-2 font-bold">
          {!isUser ? "WADI_SYSTEM" : "USER_INPUT"}
        </span>

        {/* Render Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {attachments.map((att, idx) => {
              if (att.type.startsWith("image/")) {
                return (
                  <div
                    key={idx}
                    className="relative mb-3 overflow-hidden border border-[var(--border-subtle)]"
                  >
                    <img
                      src={att.url}
                      alt={att.name || "Adjunto"}
                      className="w-full h-auto object-cover max-h-96"
                      onClick={() => window.open(att.url, "_blank")}
                    />
                  </div>
                );
              }
              return (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs hover:text-[var(--text-primary)] transition-colors"
                >
                  <AttachmentIcon size={14} />
                  <span className="truncate max-w-[200px]">{att.name}</span>
                </a>
              );
            })}
          </div>
        )}

        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {content.trim()}
        </div>

        {/* Minimalist Time */}
        {timestamp && (
          <span className="text-[9px] mt-2 block text-right text-[var(--text-muted)] font-mono tracking-widest opacity-50">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
