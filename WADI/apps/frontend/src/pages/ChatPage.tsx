import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useStoreHydration } from "../hooks/useStoreHydration";
import { useUserSimulator } from "../tools/UserSimulator"; // Import

import { TerminalInput } from "../components/ui/TerminalInput";
import { Scouter } from "../components/ui/Scouter";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import { DataDeconstructor } from "../components/auditor/DataDeconstructor";
import { Dropzone } from "../components/auditor/Dropzone";
import { MessageBubble } from "../components/MessageBubble";
import { WadiTheme } from "../theme/wadi-theme";

export default function ChatPage() {
  const { conversationId } = useParams();
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
    activeFocus,
  } = useChatStore();

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations();
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      if (storeConversationId) resetChat();
    }
  }, [
    conversationId,
    loadConversation,
    resetChat,
    storeConversationId,
    loadConversations,
  ]);

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

  // Handle message sending
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = []
  ) => {
    if (!text.trim() && attachments.length === 0) return;
    await sendMessage(text, attachments);
  };

  const hasMessages = messages.length > 0;

  if (!hydrated) return null;

  return (
    <Layout>
      <Scouter />
      <Dropzone />

      <div className="flex h-full max-w-7xl mx-auto w-full gap-4 pt-16 md:pt-4 px-2 md:px-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-500">
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
                Esperando ingreso
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
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Floating Input Area */}
          <div className="w-full px-4 pb-4 md:px-0 z-20">
            <TerminalInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              activeFocus={activeFocus}
            />
          </div>
        </div>

        {/* Side Panel (Context - Desktop Only - Subtle) */}
        <div className="hidden lg:block w-[300px] h-full p-6 pt-24 opacity-40 pointer-events-none select-none transition-opacity duration-1000">
          <div className="border-l border-slate-200 pl-6 space-y-8 pointer-events-auto">
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                Estado Neural
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
                  className={`px-2 py-0.5 rounded ${sim.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-100"}`}
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
