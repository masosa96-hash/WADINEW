import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#0f0f11",
          color: "#ef4444",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "monospace"
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            💥 ERROR CRÍTICO DEL SISTEMA
          </h1>
          <p style={{ color: "#fafafa", marginBottom: "2rem" }}>
            Incluso WADI tiene sus límites. Algo se rompió seriamente.
          </p>
          <div style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            textAlign: "left",
            maxWidth: "600px",
            overflow: "auto",
            fontSize: "12px",
            color: "#fca5a5"
          }}>
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>DETALLES DEL ERROR:</p>
            <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error?.message}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "999px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase"
            }}
          >
            PURGAR & REINICIAR (F5)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
