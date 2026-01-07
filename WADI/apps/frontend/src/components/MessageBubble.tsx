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
    <div className="flex w-full mb-8 animate-enter">
      <div
        className={`w-full max-w-4xl px-6 py-4 rounded-[var(--radius-lg)] transition-all duration-200 ${
          !isUser
            ? "bg-[var(--wadi-surface)] border border-[var(--wadi-border)] hover:border-[var(--wadi-border-hover)]"
            : "bg-transparent border border-transparent"
        }`}
      >
        {/* Role Label */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              !isUser ? "bg-[var(--wadi-primary)]" : "bg-[var(--wadi-text-dim)]"
            }`}
          />
          <span className="text-xs font-medium text-[var(--wadi-text-dim)] uppercase tracking-wide">
            {!isUser ? "WADI" : "Vos"}
          </span>
          {timestamp && (
            <span className="text-xs text-[var(--wadi-text-dim)] ml-auto">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {attachments.map((att, idx) => {
              if (att.type.startsWith("image/")) {
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--wadi-border)] cursor-pointer hover:border-[var(--wadi-primary)] transition-colors"
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
                  className="flex items-center gap-3 px-4 py-2 bg-[var(--wadi-surface)] border border-[var(--wadi-border)] rounded-[var(--radius-md)] text-sm hover:border-[var(--wadi-primary)] transition-colors"
                >
                  <AttachmentIcon size={16} className="text-[var(--wadi-primary)]" />
                  <span className="truncate text-[var(--wadi-text)]">{att.name}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Message Content */}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            !isUser
              ? "text-[var(--wadi-text)] font-[var(--font-sans)]"
              : "text-[var(--wadi-text-secondary)] font-[var(--font-sans)]"
          }`}
        >
          {content.trim()}
        </div>
      </div>
    </div>
  );
}
