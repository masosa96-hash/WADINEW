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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--wadi-bg)] text-[var(--wadi-alert)] p-8 text-center font-mono-wadi">
          <h1 className="text-4xl font-bold mb-4">
            💥 CRITICAL SYSTEM FAILURE
          </h1>
          <p className="text-xl text-[var(--wadi-text)] mb-8">
            Ni siquiera WADI puede fingir que esto está bien.
          </p>
          <div className="bg-black/50 p-4 rounded border border-[var(--wadi-alert)]/30 text-left max-w-2xl overflow-auto text-xs text-red-300">
            <p className="font-bold mb-2">ERROR TRACE:</p>
            <pre>{this.state.error?.message}</pre>
            <pre className="mt-2 text-[var(--wadi-text-muted)] opacity-50">
              {this.state.error?.stack}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-2 bg-[var(--wadi-alert)] text-white rounded hover:bg-red-600 transition-colors uppercase font-bold tracking-widest"
          >
            PURGAR & REINICIAR (F5)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
