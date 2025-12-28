interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  attachments?: any[]; // Allow attachments support if needed
}

export function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex flex-col mb-4 w-full ${isUser ? "items-end" : "items-start"}`}
    >
      <div className={isUser ? "bubble-user" : "bubble-monday"}>
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div>
            {content.split(/(?=^#{1,3}\s)/m).map((block, i) => {
              // Simple markdown header parsing for Monday's structure
              const match = block.match(/^(#{1,3})\s+(.+)(\r?\n|$)/);
              if (match) {
                const title = match[2].trim();
                const body = block.replace(match[0], "").trim();
                return (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="font-bold text-[1.05em] mb-1 text-[#8B5CF6]">
                      {title}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-600 font-light">
                      {body}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="whitespace-pre-wrap leading-relaxed text-slate-600 font-light"
                >
                  {block.trim()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {timestamp && (
        <span className="text-[10px] text-slate-400 px-2 mt-1">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
