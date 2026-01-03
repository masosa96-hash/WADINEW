import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useStoreHydration } from "../hooks/useStoreHydration";
import { useUserSimulator } from "../tools/UserSimulator"; // Import

import { OperationsMonitor } from "../components/ui/OperationsMonitor";
import { TerminalInput } from "../components/ui/TerminalInput";
import { Scouter } from "../components/ui/Scouter";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import { DataDeconstructor } from "../components/auditor/DataDeconstructor";
import { Dropzone } from "../components/auditor/Dropzone";
import { MessageBubble } from "../components/MessageBubble";
import { WadiTheme } from "../theme/wadi-theme";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const hydrated = useStoreHydration();
  // Simulator Hook
  const sim = useUserSimulator();

  const {
    messages,
    isLoading,
    sendMessage,
    loadConversations,
    resetChat,
    loadConversation,
    conversationId: storeConversationId,
    isTyping, // Replaces isWadiThinking
    subscribeToMessages,
    startNewChat,
  } = useChatStore();

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations();
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      if (storeConversationId) {
        loadConversation(storeConversationId);
        window.history.replaceState({}, "", `/c/${storeConversationId}`);
      }
    }
  }, [
    conversationId,
    loadConversation,
    resetChat,
    storeConversationId,
    loadConversations,
  ]);

  // Realtime Subscription
  useEffect(() => {
    if (storeConversationId) {
      const unsubscribe = subscribeToMessages(storeConversationId);
      return () => {
        unsubscribe();
      };
    }
  }, [storeConversationId, subscribeToMessages]);

  const handleNewChat = () => {
    startNewChat();
    navigate("/");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(0);

  // Scroll Handling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const newCount = messages.length;
    const oldCount = prevMessagesLength.current;

    if (newCount > oldCount) {
      const lastMsg = messages[newCount - 1];
      const isMyMessage = lastMsg.role === "user";

      if (isMyMessage || shouldAutoScroll) {
        scrollToBottom();
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, shouldAutoScroll]);

  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = []
  ) => {
    if (!text.trim() && attachments.length === 0) return;
    await sendMessage(text, attachments);
    // Navigation is handled in store/realtime update usually, but if needed here:
    // With current store logic, if we are in 'new' state, store updates activeId.
    // We can rely on a store listener or just check activeId changes if we wanted.
  };

  const hasMessages = messages.length > 0;

  if (!hydrated) return null;

  return (
    <Layout>
      <Scouter />
      <OperationsMonitor />
      <Dropzone />

      <div className="flex h-full max-w-7xl mx-auto w-full gap-4 pt-16 md:pt-4 px-2 md:px-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-500">
          {/* Top Actions Bar (Industrial) */}
          <div className="absolute top-2 right-4 z-50 flex gap-2 p-1 rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-900">
            {/* Placeholder for future tools if needed */}
            <button
              onClick={handleNewChat}
              className="group flex items-center space-x-2 px-3 py-1 border border-zinc-800 hover:border-orange-900 transition-colors bg-transparent rounded"
              aria-label="Iniciar nueva sesión"
            >
              <div className="w-1.5 h-1.5 bg-zinc-700 group-hover:bg-orange-900 rotate-45 transition-colors"></div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 uppercase">
                Nueva Sesión
              </span>
            </button>
          </div>

          {!hasMessages ? (
            // WADI MODERN EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-enter">
              <div className="relative group">
                <div
                  className={`w-24 h-24 ${WadiTheme.layout.radiusFull} ${WadiTheme.effects.glass} ${WadiTheme.effects.glowMain} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}
                >
                  <div
                    className={`w-16 h-16 ${WadiTheme.layout.radiusFull} ${WadiTheme.gradients.logo} opacity-80 ${WadiTheme.effects.pulseSoft}`}
                  ></div>
                </div>
              </div>

              <div className="text-center space-y-4 max-w-md px-4">
                <h1
                  className={`text-2xl md:text-3xl ${WadiTheme.typography.display} text-[var(--wadi-text)] ${WadiTheme.typography.mono}`}
                >
                  WADI
                </h1>
                <p
                  className={`text-sm md:text-base leading-relaxed text-[var(--wadi-text-secondary)] ${WadiTheme.typography.mono}`}
                >
                  "Si buscás que te den la razón, ni te gastes. No nos vamos a
                  querer. ¿Qué sale?"
                </p>
              </div>

              {/* Minimalist Action Prompt */}
              <div className="opacity-40 text-xs text-[var(--wadi-text-secondary)] uppercase tracking-widest font-medium">
                Listo para iniciar
              </div>
            </div>
          ) : (
            // Message List
            <div
              className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-6 scrollbar-hide"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              <AuditorHeader />

              {messages.map((message) => {
                // Check if message triggers special UI
                const isDeconstruct = message.content.includes(
                  "[DECONSTRUCT_START]"
                );
                let displayContent = message.content;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let deconstructItems: any[] = [];

                if (isDeconstruct) {
                  try {
                    const jsonMatch = message.content.match(
                      /\[DECONSTRUCT_START\]([\s\S]*?)\[DECONSTRUCT_END\]/
                    );
                    if (jsonMatch && jsonMatch[1]) {
                      let rawJson = jsonMatch[1];
                      // Sanitizer: Find first '[' and last ']' to ignore markdown noise
                      const firstBracket = rawJson.indexOf("[");
                      const lastBracket = rawJson.lastIndexOf("]");

                      if (firstBracket !== -1 && lastBracket !== -1) {
                        rawJson = rawJson.substring(
                          firstBracket,
                          lastBracket + 1
                        );
                        deconstructItems = JSON.parse(rawJson);
                        displayContent = message.content
                          .replace(jsonMatch[0], "")
                          .trim();
                      }
                    }
                  } catch (e) {
                    console.error("Deconstruct Parse Error", e);
                  }
                }

                return (
                  <div key={message.id} className="space-y-4">
                    <MessageBubble
                      role={message.role === "assistant" ? "assistant" : "user"}
                      content={displayContent}
                      timestamp={message.created_at}
                    />
                    {deconstructItems.length > 0 && (
                      <DataDeconstructor items={deconstructItems} />
                    )}
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start px-4 animate-pulse">
                  <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                    <span>🎭</span>
                    <span>WADI está procesando su desprecio...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Floating Input Area */}
          <div className="w-full px-4 pb-4 md:px-0 z-20">
            <TerminalInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Side Panel (Context - Desktop Only) */}
        <div className="hidden lg:block w-[300px] h-full p-6 pt-24 transition-opacity duration-1000">
          <div className="border-l border-slate-200/10 pl-6 space-y-8">
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                Estado del Sistema
              </h2>
              <div className="text-slate-300 text-xs">Sincronizado</div>
            </div>

            {/* SIMULATOR UI MOD */}
            <div className="bg-black/40 p-2 rounded text-[10px] space-y-2 pointer-events-auto">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 uppercase font-mono">
                  Auto-Test
                </span>
                <button
                  onClick={sim.toggle}
                  aria-label="Alternar simulador de usuario"
                  className={`px-2 py-0.5 rounded font-bold ${sim.isActive ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-black text-white border border-zinc-600"}`}
                >
                  {sim.isActive ? "ON" : "OFF"}
                </button>
              </div>
              {sim.isActive && (
                <div className="space-y-1 text-slate-400 font-mono">
                  <div>Msg Sent: {sim.stats.messagesSent}</div>
                  <div>Last Lat: {sim.stats.latency}ms</div>
                  <div className="border-t border-slate-700 pt-1 mt-1">
                    {sim.logs.map((l, i) => (
                      <div key={i} className="truncate opacity-70">
                        - {l}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
