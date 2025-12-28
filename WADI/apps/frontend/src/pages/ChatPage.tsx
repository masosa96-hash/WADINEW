import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useStoreHydration } from "../hooks/useStoreHydration";

import { TerminalInput } from "../components/ui/TerminalInput";
import { Scouter } from "../components/ui/Scouter";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import { DataDeconstructor } from "../components/auditor/DataDeconstructor";
import { Dropzone } from "../components/auditor/Dropzone";
import { MessageBubble } from "../components/MessageBubble";

export default function ChatPage() {
  const { conversationId } = useParams();
  const hydrated = useStoreHydration();

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
            // NEO-MODERN EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_0_40px_rgba(139,92,246,0.15)] flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#38bdf8] opacity-80 animate-pulse-soft"></div>
                </div>
              </div>

              <div className="text-center space-y-2 max-w-md">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
                  Hola, soy Monday.
                </h1>
                <p className="text-slate-500 text-lg font-light">
                  ¿En qué plan estamos hoy?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {[
                  { label: "Brainstorming", icon: "✨" },
                  { label: "Revisar Código", icon: "💻" },
                  { label: "Plan de Negocio", icon: "📈" },
                  { label: "Solo Charlar", icon: "☕" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSendMessage(item.label)}
                    className="p-4 bg-white/60 hover:bg-white border border-white/50 shadow-sm rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-md group"
                  >
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </button>
                ))}
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
                      deconstructItems = JSON.parse(jsonMatch[1]);
                      displayContent = message.content
                        .replace(jsonMatch[0], "")
                        .trim();
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
        {!hasMessages && (
          <div className="hidden lg:block w-[300px] h-full p-6 pt-24 opacity-40 pointer-events-none select-none transition-opacity duration-1000">
            <div className="border-l border-slate-200 pl-6 space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                  Estado Neural
                </h3>
                <div className="text-slate-300 text-xs">Sincronizado</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
