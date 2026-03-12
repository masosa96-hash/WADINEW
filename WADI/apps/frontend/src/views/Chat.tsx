import { useState, useEffect, useRef, useMemo } from 'react';
import { API_URL } from "../config/api";
import { useParams, useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectsStore } from '../store/projectsStore';
import { useChatStore } from '../store/chatStore';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

// Central constant — avoids magic string bugs
export const GUEST_PROJECT_ID = "guest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AssistantMessage({ message, onAction }: { message: any, onAction: (t: string) => void }) {
  if (!message) return null;
  
  if (message.ui_hint === "clarification_cards") {
    return (
      <div className="space-y-4 font-wadi-sans text-sm">
        <div className="bg-wadi-gray-50 p-4 rounded-xl border border-wadi-gray-100 shadow-sm">
          <p className="font-medium text-wadi-gray-900">{message.message}</p>
        </div>
        <div className="flex flex-col gap-2">
          {message.questions?.map((q: string, i: number) => (
            <button key={i} onClick={() => onAction(q)} className="text-left px-5 py-3 bg-white border border-wadi-gray-200 rounded-xl hover:border-wadi-accent-end hover:bg-wadi-gray-50 transition-all text-wadi-gray-700 font-medium shadow-sm">
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (message.ui_hint === "confirmation_panel") {
    return (
      <div className="space-y-4 max-w-sm font-wadi-sans text-sm">
        <div className="bg-wadi-black text-white p-6 rounded-2xl shadow-xl">
          <h4 className="font-bold mb-4 flex items-center gap-2 tracking-wide font-wadi-mono text-xs uppercase text-wadi-accent-start">✨ Resumen de tu Idea</h4>
          <div className="space-y-3 text-wadi-gray-300 bg-wadi-gray-900/50 p-4 rounded-xl border border-wadi-gray-700">
            <p><strong className="text-wadi-gray-100">Proyecto:</strong> {message.intent?.idea}</p>
            <p><strong className="text-wadi-gray-100">Enfoque:</strong> {message.intent?.domain}</p>
            <p><strong className="text-wadi-gray-100">Usuarios:</strong> {message.intent?.target}</p>
          </div>
          <p className="mt-5 font-medium text-center">{message.message}</p>
          <div className="mt-4 flex gap-3">
             <button onClick={() => onAction("Sí, confirmar y avanzar")} className="flex-1 bg-wadi-accent-start hover:bg-wadi-accent-start/90 text-white py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs">Confirmar</button>
             <button onClick={() => onAction("Quiero ajustar algunos detalles")} className="flex-1 bg-wadi-gray-800 border-none hover:bg-wadi-gray-700 text-white py-2.5 rounded-xl font-bold transition-colors active:scale-95 text-xs">Editar</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (message.ui_hint === "execution_status") {
     return (
       <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm max-w-sm font-wadi-sans">
          <h4 className="font-black text-green-900 text-lg">✅ Proyecto Generado</h4>
          <p className="text-green-800 text-sm mt-1 mb-4">{message.message}</p>
          {message.first_step && (
             <div className="p-4 bg-white rounded-xl border border-green-100/50 text-sm text-wadi-gray-700 shadow-sm font-wadi-mono">
               <strong className="block text-green-700 mb-2 uppercase text-[10px] tracking-wider">Primer paso recomendado</strong>
               {message.first_step}
             </div>
          )}
       </div>
     );
  }

  // Fallback
  return <div className="whitespace-pre-wrap text-wadi-gray-800 leading-relaxed font-wadi-sans text-sm">{message.message || (typeof message === "string" ? message : JSON.stringify(message))}</div>;
}

export default function Chat() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { projects } = useProjectsStore();
  const { 
    messages, 
    isStreaming, 
    streamingContent, 
    sendMessageStream, 
    openConversation 
  } = useChatStore();

  // If no ID in URL, we are on the home route.
  // If user is logged in, we COULD redirect to their first project or GENERAL.
  // For now, let's just use "guest" if NO id is provided, to keep it consistent with the user's request.
  const id = paramId || GUEST_PROJECT_ID;
  const isGuest = id === GUEST_PROJECT_ID;

  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<{ id: string; content: string } | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [firstMessageAt, setFirstMessageAt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Load history (authenticated users only) ──────────────────────────────
  useEffect(() => {
    if (id) {
      openConversation(id);
    }
  }, [id, openConversation]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    const behavior = isStreaming ? 'auto' : 'smooth';
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior });
    });
  }, [streamingContent, messages, isStreaming]);

  // ─── Crystal candidate detection ──────────────────────────────────────────
  const extractCrystalCandidate = (text: string) => {
    const CRYSTAL_REGEX = /\[CRYSTAL_CANDIDATE:\s*({[\s\S]*?})(?:\s*\]|$)/m;
    const match = text.match(CRYSTAL_REGEX);
    if (!match?.[1]) return null;
    try {
      const data = JSON.parse(match[1]);
      if (!data?.name || !data?.description) return null;
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!streamingContent) return;
    const candidateData = extractCrystalCandidate(streamingContent);
    if (!candidateData) return;
    setSuggestion((prev) => {
      const prevDescription = prev ? JSON.parse(prev.content).content : '';
      if (prevDescription === candidateData.description) return prev;
      return {
        id: 'temp-' + Date.now(),
        content: JSON.stringify({
          content: candidateData.description,
          name: candidateData.name,
          tags: candidateData.tags ?? [],
        }),
      };
    });
  }, [streamingContent]);

  // ─── Suggestions polling (authenticated only) ─────────────────────────────
  useEffect(() => {
    if (isGuest || !session?.access_token) return;
    const checkSuggestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects/suggestions/pending`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.length > 0) {
            const sugg = data[0];
            if (sugg.id !== localStorage.getItem('last_dismissed_suggestion')) {
              setSuggestion(sugg);
            }
          }
        }
      } catch {
        // Ignore polling errors
      }
    };
    const interval = setInterval(checkSuggestions, 8000);
    return () => clearInterval(interval);
  }, [isGuest, session?.access_token]);

  // ─── Crystallize ────────────────────────────────────────────────────────
  const handleCrystallize = async () => {
    if (!suggestion) return;
    let currentSession = session;
    if (!currentSession) {
      const res = await useAuthStore.getState().loginAsGuest();
      if (res.error) return;
      currentSession = useAuthStore.getState().session;
    }
    if (!currentSession?.access_token) return;
    setIsCrystallizing(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/crystallize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({ 
          suggestionContent: suggestion.content,
          firstMessageAt
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestion(null);
        localStorage.setItem('last_dismissed_suggestion', suggestion.id);
        navigate(`/projects/${data.project.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCrystallizing(false);
    }
  };

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !id) return;
    const currentInput = input;
    setInput('');
    if (!firstMessageAt) {
      setFirstMessageAt(new Date().toISOString());
    }
    await sendMessageStream(currentInput);
  };

  // ─── Message display ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanContent = (text: any) => {
    if (typeof text !== "string") return text;
    return text.replace(/\[CRYSTAL_CANDIDATE:[\s\S]*/gm, '').trim();
  };

  const displayMessages = messages.map((m) => ({ ...m, content: cleanContent(m.content) }));

  const cleanedStreamingContent = useMemo(() => cleanContent(streamingContent), [streamingContent]);

  if (isStreaming || streamingContent) {
    displayMessages.push({ 
        id: 'streaming-assistant', 
        role: 'assistant', 
        content: cleanedStreamingContent, 
        created_at: new Date().toISOString() 
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white text-wadi-gray-900 relative pb-32">
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 font-wadi-sans border-b border-wadi-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
            <span className="text-[10px] font-bold text-wadi-gray-500 uppercase tracking-widest font-wadi-mono">WADI SECURE CONNECTION</span>
          </div>
          
          {!isGuest && (
            <button 
              onClick={() => navigate(`/projects/${id}/builder`)}
              className="text-[10px] font-bold text-wadi-accent-end border border-wadi-accent-end/20 px-3 py-1 rounded-full bg-wadi-accent-end/5 uppercase tracking-wider hover:bg-wadi-accent-end/10 transition-colors"
            >
              Building Mode
            </button>
          )}
        </div>
        {isGuest && (
          <div className="text-[10px] text-wadi-gray-400 font-wadi-mono uppercase tracking-wider">
            Guest Session <span className="mx-2">•</span> <button onClick={() => navigate('/login')} className="text-wadi-accent-end hover:underline font-bold">Login to persist</button>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 w-full">
        <div className="w-full">
          {displayMessages.length === 0 && (
            <div className="text-center py-32 px-6 font-wadi-sans">
              <div className="w-16 h-16 bg-wadi-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Bot size={32} />
              </div>
              <h2 className="text-2xl font-bold text-wadi-gray-900 mb-4 tracking-tight">WADI Engine</h2>
              <div className="text-wadi-gray-500 max-w-md mx-auto leading-relaxed space-y-4 font-medium text-sm">
                {isGuest ? (
                  <p>
                    Si tenés una idea, escupila acá. Yo me encargo de que no sea solo humo y se convierta en algo que funcione de verdad. No me hagas perder el tiempo.
                  </p>
                ) : projects.length > 0 ? (
                  <p>
                    ¿Qué vas a inventar hoy? Ya tenés cosas en la base, pero si querés arrancar algo nuevo de cero, soy todo oídos. Vos decime.
                  </p>
                ) : (
                  <p>
                    WADI Engine. Soltá el problema acá arriba. Yo diseño y armo toda la arquitectura para que vos no tengas que mover un dedo. ¿Arrancamos?
                  </p>
                )}
                
                {(!isGuest && projects.length === 0) && (
                  <div className="pt-6 mt-6 border-t border-wadi-gray-100 text-[10px] font-bold text-wadi-accent-start uppercase tracking-widest animate-pulse font-wadi-mono">
                    Aguardando input para iniciar Forge Engine
                  </div>
                )}
              </div>
            </div>
          )}

          {displayMessages.map((msg, index) => {
             const isObject = msg.role === 'assistant' && typeof msg.content === 'object';
             return (
                <div key={msg.id} className="w-full relative">
                  {isObject ? (
                     <div className="w-full py-8 bg-wadi-gray-50/50">
                        <div className="max-w-3xl mx-auto px-4 pl-[4.5rem]">
                            <AssistantMessage message={msg.content} onAction={(actionInput) => {
                              setInput(actionInput);
                              setTimeout(() => document.getElementById('chat-input')?.focus(), 50);
                            }} />
                        </div>
                     </div>
                  ) : (
                    <ChatMessage 
                       role={msg.role as 'user' | 'assistant'} 
                       content={msg.content as string} 
                       insights={msg.id === 'streaming-assistant' ? undefined : undefined} 
                    />
                  )}

                  {/* Crystal suggestion */}
                  {msg.role === 'assistant' && suggestion && index === displayMessages.length - 1 && (
                    <div className="w-full bg-wadi-gray-50/30 border-y border-wadi-accent-start/20 py-8">
                      <div className="max-w-3xl mx-auto px-4 pl-[4.5rem]">
                        <div className="p-5 border border-wadi-accent-start/30 bg-wadi-accent-start/5 rounded-2xl shadow-sm">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                              <h4 className="text-sm font-bold text-wadi-gray-900 flex items-center gap-2">
                                <span className="text-wadi-accent-start">⚡</span> {JSON.parse(suggestion.content).name}
                              </h4>
                              <p className="text-sm text-wadi-gray-600 mt-2 font-wadi-sans">{JSON.parse(suggestion.content).content}</p>
                            </div>
                            <button
                              onClick={handleCrystallize}
                              className="px-6 py-3 bg-wadi-black text-white text-xs font-bold rounded-xl hover:bg-wadi-gray-900 transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                            >
                              {isCrystallizing ? 'INITIALIZING...' : 'CRYSTALLIZE'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
             );
          })}

          <div ref={scrollRef} className="h-10" />
        </div>
      </div>

      {/* Input Flotante */}
      <ChatInput input={input} setInput={setInput} handleSend={handleSend} isStreaming={!!isStreaming} />
    </div>
  );
}
