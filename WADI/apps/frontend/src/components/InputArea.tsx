import { useState } from "react";
import type { KeyboardEvent } from "react";

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
}

export function InputArea({
  onSend,
  disabled,
  placeholder,
  suggestions,
}: InputAreaProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
    // Reset height manually if needed, though state change might cause re-render which resets style if we were not careful.
    // Ideally we reset height via ref, but let's stick to the simple onInput for now.
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      // Reset height
      (e.target as HTMLTextAreaElement).style.height = "auto";
    }
  };

  return (
    <div
      style={{
        padding: "1rem 1.5rem 1.5rem",
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        transition: "background-color 0.2s",
      }}
    >
      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            scrollbarWidth: "none", // Hide scrollbar for cleaner look
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              disabled={disabled}
              style={{
                fontSize: "var(--text-xs)",
                padding: "0.4rem 1rem",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-soft)",
                borderRadius: "999px",
                border: "1px solid var(--color-border)",
                whiteSpace: "nowrap",
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface-soft)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text-soft)";
                }
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.75rem",
          backgroundColor: "var(--color-surface)",
          padding: "0.75rem 1rem",
          borderRadius: "1.5rem", // More rounded
          border: "1px solid var(--color-border)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Escribe un mensaje..."}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            maxHeight: "120px",
            minHeight: "24px",
            padding: "0.25rem 0",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "var(--text-base)",
            color: "var(--color-text-main)",
            fontFamily: "var(--font-sans)",
            lineHeight: 1.5,
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            backgroundColor:
              text.trim() && !disabled
                ? "var(--color-primary)"
                : "var(--color-surface-soft)",
            color:
              text.trim() && !disabled ? "white" : "var(--color-text-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            transition: "all 0.2s",
            cursor: text.trim() && !disabled ? "pointer" : "default",
            opacity: disabled ? 0.7 : 1,
          }}
          aria-label="Enviar"
        >
          {/* Simple Arrow Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <small
        style={{
          textAlign: "center",
          opacity: 0.6,
          fontSize: "0.75rem",
          color: "var(--color-text-soft)",
        }}
      >
        WADI puede cometer errores. Verifica la información importante.
      </small>
    </div>
  );
}
