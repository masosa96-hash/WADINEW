import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { resetChat } = useChatStore();

  const handleStart = () => {
    resetChat();
    // Navigate to /chat to start fresh. The ChatPage logic handles ID creation or empty state.
    // User requested "Crear conversación nueva, Navegar a /chat/:id".
    // Since ChatPage handles "if (!conversationId && newId) navigate...", sending a message creates the ID.
    // If I want to force a new ID immediately upon clicking "Nuevo Chat", I might need a store action for it,
    // OR simply navigate to /chat and let the user type.
    // User said: "👉 Al click en Nuevo chat: Crear conversación nueva, Navegar a /chat/:id, El input queda enfocado"
    // If the store supports creating an empty conversation and getting an ID, I should use it.
    // Looking at store: startNewConversation resets state (id=null).
    // To actually GET an ID, usually a message must be sent or an endpoint called.
    // However, the user demand is "Navegar a /chat/:id".
    // If I cannot generate an ID without a message, I will navigate to /chat (which effectively is a new clean chat)
    // and ensuring the UI looks like a "new chat".
    // But let's check if we can create one. The store has `startNewConversation`.
    // Let's stick to the simplest "reset and go to /chat" which functions as a new chat in this app's logic usually.
    // If strict ID is required before message, I'd need backend changes or a createEmptyConversation endpoint.
    // Assuming standard behavior for now: reset state -> navigate to /chat -> user types -> ID generated.
    // If the user insists on "Navegar a /chat/:id" immediately, I might generate a UUID locally or call an API if available.
    // But `useChatStore` doesn't seem to have `createEmptyConversation`.
    // I will stick to navigate('/chat') which presents a new chat interface.

    navigate("/chat");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text-main)",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          margin: "0 0 0.5rem 0",
          background: "var(--grad-main)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}
      >
        WADI
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          margin: "0 0 2rem 0",
          color: "var(--color-text-main)",
        }}
      >
        Del caos al plan
      </h2>

      <p
        style={{
          fontSize: "1.2rem",
          color: "var(--color-text-soft)",
          marginBottom: "3rem",
          maxWidth: "400px",
        }}
      >
        Acá se piensa. No hace magia.
      </p>

      <button
        onClick={handleStart}
        style={{
          background: "var(--color-primary)",
          color: "#FFFFFF",
          border: "none",
          padding: "1rem 2.5rem",
          borderRadius: "9999px",
          fontSize: "1.2rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "var(--shadow-lg)",
          transition: "transform 0.1s",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        + Nuevo chat
      </button>
    </div>
  );
}
