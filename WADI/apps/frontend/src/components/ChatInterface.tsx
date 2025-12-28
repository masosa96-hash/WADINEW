import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { InputArea } from "./InputArea";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatInterfaceProps {
  title?: string;
  status?: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isThinking?: boolean;
  suggestions?: string[];
}

export function ChatInterface({
  title,
  status,
  messages,
  onSendMessage,
  isThinking,
  suggestions,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "1rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--color-surface)", // Sticky header if needed
          zIndex: 5,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-text-main)",
            }}
          >
            {title || "New Conversation"}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--color-success)",
                boxShadow: "0 0 5px var(--color-success)",
              }}
            />
            <small
              style={{
                color: "var(--color-text-soft)",
                fontSize: "var(--text-xs)",
              }}
            >
              {status || "Online"}
            </small>
            {isThinking && (
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-primary)",
                  fontStyle: "italic",
                  animation: "pulse 1.5s infinite",
                  marginLeft: "0.5rem",
                }}
              >
                WADI está pensando...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem", // Gap between messages
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "1rem",
              opacity: 0.8,
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                background: "var(--grad-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))",
              }}
            >
              🚀
            </div>
            <h3
              style={{
                fontSize: "var(--text-2xl)",
                color: "var(--color-text-main)",
              }}
            >
              Iniciá tu primera conversación
            </h3>
            <p style={{ color: "var(--color-text-soft)" }}>
              Escribí tu pregunta, idea o problema abajo para empezar.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isThinking && (
          <div
            style={{
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: 0.8,
              color: "var(--color-text-soft)",
              fontSize: "var(--text-sm)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                animation: "pulse 1s infinite",
              }}
            />
            <span>Ordenando tus ideas...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputArea
        onSend={onSendMessage}
        disabled={isThinking}
        suggestions={suggestions}
      />
    </div>
  );
}
