import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useStoreHydration } from "../hooks/useStoreHydration";
import { OperationsMonitor } from "../components/ui/OperationsMonitor";
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
    isTyping,
    subscribeToMessages,
  } = useChatStore();

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

  useEffect(() => {
    if (storeConversationId) {
      const unsubscribe = subscribeToMessages(storeConversationId);
      return () => {
        unsubscribe();
      };
    }
  }, [storeConversationId, subscribeToMessages]);



  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(0);

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
  };

  const hasMessages = messages.length > 0;

  if (!hydrated) return null;

  return (
    <Layout>
      <Scouter />
      <OperationsMonitor />
      <Dropzone />

      <div className="flex h-full max-w-7xl mx-auto w-full gap-4 pt-16 md:pt-4 px-2 md:px-0 font-mono">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative z-10">
          {!hasMessages ? (
            // EMPTY STATE (Minimalist)
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              <div className="w-16 h-16 border-2 border-[var(--text-primary)] flex items-center justify-center">
                <div className="w-4 h-4 bg-[var(--text-primary)] animate-pulse" />
              </div>

              <div className="text-center max-w-md space-y-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-widest uppercase">
                  SISTEMA_WADI_V5
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Esperando input. Sé preciso.
                </p>
              </div>
            </div>
          ) : (
            // Message List
            <div
              className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-8 scrollbar-hide"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              <AuditorHeader />

              {messages.map((message) => {
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
                <div className="flex justify-start px-4">
                  <div className="text-xs text-[var(--text-muted)] animate-pulse">
                    [PROCESANDO...]
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Input Area */}
          <div className="w-full px-4 pb-4 md:px-0 z-20">
            <TerminalInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
