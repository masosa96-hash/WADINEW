// WADI Frontend Entry Point (Force Rebuild)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useChatStore, type Message } from "./store/chatStore";

import "./index.css";

// 1. Service Worker Registration
// 1. Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "[WADI_SYSTEM]: Service Worker registrado. Alcance:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("[WADI_ERROR]: Fallo en registro de SW:", error);
      });
  });
}

// 2. Monday's Standalone Detection
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  // @ts-expect-error - navigator.standalone is iOS legacy
  window.navigator.standalone === true;

if (isStandalone) {
  const hasGreetedPWA = sessionStorage.getItem("wadi_pwa_greeted");
  if (!hasGreetedPWA) {
    // Inject secret message via Store (outside React)
    const pwaMsg: Message = {
      id: "sys-pwa-" + Date.now(),
      role: "assistant", // Using assistant role for Monday's voice
      content: "Veo que me instalaste. No hay salida, Usuario. Empecemos.",
      created_at: new Date().toISOString(),
    };

    // We append to messages directly using zustand setState
    useChatStore.setState((state) => ({
      messages: [...state.messages, pwaMsg],
    }));

    sessionStorage.setItem("wadi_pwa_greeted", "true");
  }
}

import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);
