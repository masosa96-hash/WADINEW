import { useState, useEffect, useRef, useMemo } from 'react';
import { API_URL } from "../config/api";
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User, Bot } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectsStore } from '../store/projectsStore';
import { useChatStore } from '../store/chatStore';

// Central constant — avoids magic string bugs
export const GUEST_PROJECT_ID = "guest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AssistantMessage({ message, onAction }: { message: any, onAction: (t: string) => void }) {
  if (!message) return null;
  
  if (message.ui_hint === "clarification_cards") {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100/50 shadow-sm">
          <p className="font-medium text-blue-900">{message.message}</p>
        </div>
        <div className="flex flex-col gap-2">
          {message.questions?.map((q: string, i: number) => (
            <button key={i} onClick={() => onAction(q)} className="text-left px-5 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm transition-all text-gray-700 font-medium">
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (message.ui_hint === "confirmation_panel") {
    return (
      <div className="space-y-4 max-w-sm">
        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">✨ Resumen de tu Idea</h4>
          <div className="space-y-3 text-sm text-indigo-800 bg-white p-4 rounded-xl border border-indigo-50/50">
            <p><strong className="text-indigo-900">Proyecto:</strong> {message.intent?.idea}</p>
            <p><strong className="text-indigo-900">Enfoque:</strong> {message.intent?.domain}</p>
            <p><strong className="text-indigo-900">Usuarios:</strong> {message.intent?.target}</p>
          </div>
          <p className="mt-5 text-sm font-medium text-indigo-900 text-center">{message.message}</p>
          <div className="mt-4 flex gap-3">
             <button onClick={() => onAction("Sí, confirmar y avanzar")} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 shadow-indigo-600/20">Confirmar</button>
             <button onClick={() => onAction("Quiero ajustar algunos detalles")} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-bold transition-colors active:scale-95">Editar</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (message.ui_hint === "execution_status") {
     return (
       <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm max-w-sm">
          <h4 className="font-black text-emerald-900 text-lg">✅ Proyecto Generado</h4>
          <p className="text-emerald-800 text-sm mt-1">{message.message}</p>
          {message.first_step && (
             <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100/50 text-sm text-gray-700 shadow-sm">
               <strong className="block text-emerald-900 mb-2 uppercase text-xs tracking-wider">Primer paso recomendado</strong>
               {message.first_step}
             </div>
          )}
       </div>
     );
  }

  // Fallback
  return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.message || (typeof message === "string" ? message : JSON.stringify(message))}</div>;
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
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

  const isGuest = id === GUEST_PROJECT_ID;

  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<{ id: string; content: string } | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [firstMessageAt, setFirstMessageAt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Load history (authenticated users only) ──────────────────────────────
  useEffect(() => {
    if (!isGuest && id && session?.access_token) {
      openConversation(id);
    }
  }, [id, isGuest, openConversation, session?.access_token]);

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
    await sendMessageStream(id, currentInput);
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
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans relative">
      <header className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WADI Online</span>
          </div>
          
          {!isGuest && (
            <button 
              onClick={() => navigate(`/projects/${id}/builder`)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors border border-blue-100 px-3 py-1 rounded-full bg-blue-50/50"
            >
              🔨 ABRIR CONSTRUCTOR
            </button>
          )}
        </div>
        {isGuest && (
          <div className="text-[10px] text-gray-400 italic">
            Sesión efímera — <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline">Iniciá sesión</button> para guardar historial
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-3xl mx-auto space-y-12 pb-10">
          {displayMessages.length === 0 && (
            <div className="text-center py-20 px-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">WADI: Socio Operacional</h2>
              <div className="text-gray-500 max-w-sm mx-auto leading-relaxed space-y-4">
                {isGuest ? (
                  <p>
                    Traé una idea, aunque esté desordenada. En segundos la convierto en un plan claro y accionable. No hace falta que esté perfecta. Arrancamos desde donde estés.
                  </p>
                ) : projects.length > 0 ? (
                  <p>
                    Tenés proyectos en marcha. ¿Querés mejorar uno o arrancar algo nuevo? Lo bajamos a tierra y lo hacemos avanzar. No acumulemos ideas, estructurémoslas.
                  </p>
                ) : (
                  <p>
                    ¿Qué estamos construyendo ahora? Traé la próxima idea o mejoramos un proyecto existente. Vamos a hacerlo más claro y más ejecutable.
                  </p>
                )}
                
                {(!isGuest && projects.length === 0) && (
                  <div className="pt-4 text-xs font-medium text-blue-600 uppercase tracking-widest animate-pulse">
                    Listo para tu primer Crystallize
                  </div>
                )}
              </div>
            </div>
          )}

          {displayMessages.map((msg, index) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="space-y-2">
                  <div className={`text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-gray-50 p-4 rounded-2xl border border-gray-100' : 'pt-1'
                  }`}>
                    {msg.role === 'assistant' && typeof msg.content === 'object' ? (
                       <AssistantMessage message={msg.content} onAction={(actionInput) => {
                         setInput(actionInput);
                         setTimeout(() => document.getElementById('chat-input')?.focus(), 50);
                       }} />
                    ) : (
                       <div className="whitespace-pre-wrap text-gray-800">{msg.content}</div>
                    )}
                  </div>

                  {/* Crystal suggestion */}
                  {msg.role === 'assistant' && suggestion && index === displayMessages.length - 1 && (
                    <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 rounded-xl animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">🚀 Idea Detectada: {JSON.parse(suggestion.content).name}</h4>
                          <p className="text-xs text-blue-700 mt-1">{JSON.parse(suggestion.content).content}</p>
                          {isGuest && (
                             <p className="text-[10px] text-blue-500/70 mt-2 italic font-medium">
                               Esta idea se guardará en tu sesión efímera.
                             </p>
                          )}
                        </div>
                        <button
                          onClick={handleCrystallize}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
                          title="Convertir esta idea en un proyecto estructurado"
                        >
                          {isCrystallizing ? 'Creating...' : 'Crystallize Project'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            id="chat-input"
            name="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribí tu idea desordenada acá..."
            className="w-full p-4 pr-16 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm placeholder:text-gray-400 font-light"
            rows={1}
            style={{ minHeight: '60px' }}
            disabled={isStreaming}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="absolute right-3 bottom-3 p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4">
          WADI v0.1 | Basado en el sistema de Personas Dinámicas
        </p>
      </footer>
    </div>
  );
}
