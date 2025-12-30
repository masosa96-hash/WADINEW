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
      className={`flex flex-col mb-4 w-full animate-enter ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-[85%] p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--wadi-surface-active)] border-[var(--wadi-border)] text-[var(--wadi-text)] rounded-tr-sm backdrop-blur-md"
            : "bg-[var(--wadi-surface)] border-[var(--wadi-primary-dim)] text-[var(--wadi-text-secondary)] rounded-tl-sm backdrop-blur-sm"
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
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="font-bold text-[1.05em] mb-1 text-[var(--wadi-primary)] tracking-wide">
                      {title}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-[var(--wadi-text-secondary)] font-normal opacity-90">
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
