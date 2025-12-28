import { useState, useEffect, useRef } from "react";
import { Button } from "./common/Button";
import { useChatStore, type Attachment } from "../store/chatStore";

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  placeholder = "¿En qué te ayudo?",
}: ChatInputProps) {
  const { uploadFile, isUploading } = useChatStore();

  // Local state for input
  const [input, setInput] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("wadi_chat_draft") || "";
      }
    } catch {
      /* ignore */
    }
    return "";
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("wadi_chat_draft", input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const attachment = await uploadFile(file);
      if (attachment) {
        setAttachments((prev) => [...prev, attachment]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || isUploading)
      return;

    const text = input.trim();

    setInput("");
    setAttachments([]);
    localStorage.removeItem("wadi_chat_draft");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(text, attachments);

    // Keep focus after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSend();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <form
      onSubmit={onFormSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "900px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] mb-2">
          {attachments.map((att, index) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.name);
            return (
              <div key={index} className="relative group shrink-0">
                {isImage ? (
                  <img
                    src={att.url}
                    alt="adjunto"
                    className="h-16 w-16 object-cover rounded-md border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="h-16 w-16 flex flex-col items-center justify-center bg-[var(--color-surface)] rounded-md border text-[10px] text-center p-1 overflow-hidden break-all gap-1">
                    <span>📄</span>
                    <span className="line-clamp-2">{att.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) =>
                      prev.filter((a) => a.url !== att.url)
                    )
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        {/* File Input (Hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.txt,.md,.pdf,.csv" // Accepted types
        />

        {/* Clip Button */}
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
          style={{
            height: "50px",
            width: "50px",
            borderRadius: "50%",
            background: "var(--color-surface)",
            color: "var(--color-text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid var(--color-border)",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          {isUploading ? "⏳" : "📎"}
        </Button>

        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            id="chat-input"
            name="chat-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={isLoading || isUploading}
            autoComplete="off"
            rows={1}
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              borderRadius: "1.5rem",
              border: "2px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-main)",
              resize: "none",
              minHeight: "50px",
              maxHeight: "200px",
              fontSize: "16px",
              outline: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
            enterKeyHint="send"
          />
        </div>
        <Button
          type="submit"
          disabled={
            isLoading ||
            isUploading ||
            (!input.trim() && attachments.length === 0)
          }
          aria-label="Enviar mensaje"
          style={{
            height: "50px",
            width: "50px",
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
            border: "2px solid #fff",
            fontSize: "1.2rem",
            transition: "transform 0.1s, opacity 0.2s",
            opacity:
              isLoading ||
              isUploading ||
              (!input.trim() && attachments.length === 0)
                ? 0.5
                : 1,
            cursor:
              isLoading ||
              isUploading ||
              (!input.trim() && attachments.length === 0)
                ? "not-allowed"
                : "pointer",
          }}
          onMouseEnter={(e) => {
            if (
              !isLoading &&
              !isUploading &&
              (input.trim() || attachments.length > 0)
            )
              e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ➤
        </Button>
      </div>
    </form>
  );
}
