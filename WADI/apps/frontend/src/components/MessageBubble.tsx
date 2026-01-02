import type { Attachment } from "../store/chatStore";
import { Paperclip } from "lucide-react";

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
      className={`flex w-full mb-6 animate-enter ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-5 py-4 border-l-2 shadow-sm transition-all duration-300 ${
          !isUser
            ? "bg-stone-900/90 border-zinc-500 text-stone-300 rounded-r-xl rounded-tl-sm backdrop-blur-sm shadow-[4px_4px_10px_rgba(0,0,0,0.2)]"
            : "bg-zinc-800/90 border-orange-900/50 text-zinc-300 rounded-l-xl rounded-tr-sm backdrop-blur-sm shadow-[4px_4px_10px_rgba(0,0,0,0.2)]"
        }`}
      >
        {/* Role Identifier - High Contrast */}
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-70 block mb-3 border-b border-white/10 pb-1 select-none font-bold">
          {!isUser ? "◈ WADI / Erudito" : "◈ Humano"}
        </span>
        {/* Render Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {attachments.map((att, idx) => {
              if (att.type.startsWith("image/")) {
                return (
                  <div
                    key={idx}
                    className="relative mb-3 overflow-hidden rounded-lg border border-[var(--wadi-primary-dim)] group max-w-md"
                  >
                    <img
                      src={att.url}
                      alt={att.name || "Captura adjunta"}
                      className="w-full h-auto cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02] object-cover max-h-96"
                      onClick={() => window.open(att.url, "_blank")}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Click para expandir
                    </div>
                  </div>
                );
              }
              return (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2 bg-black/10 rounded-md text-xs hover:bg-black/20 transition-colors"
                >
                  <Paperclip size={14} />
                  <span className="truncate max-w-[200px]">{att.name}</span>
                </a>
              );
            })}
          </div>
        )}

        <div className="font-serif italic leading-relaxed text-[0.95rem]">
          {isUser ? (
            <div className="whitespace-pre-wrap">"{content}"</div>
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

        {/* Minimalist Time inside bubble - High Contrast */}
        {timestamp && (
          <span className="text-[9px] mt-3 block text-right opacity-60 font-mono tracking-widest select-none">
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
