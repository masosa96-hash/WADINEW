import { useState, useEffect, useRef, useMemo } from 'react';
import { API_URL } from "../config/api";
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User, Bot } from 'lucide-react';
import { useRunsStore } from '../store/runsStore';
import { useAuthStore } from '../store/useAuthStore';

// Central constant — avoids magic string bugs
export const GUEST_PROJECT_ID = "guest";

interface LocalMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { runs, fetchRuns } = useRunsStore();
  const { session } = useAuthStore();

  const isGuest = id === GUEST_PROJECT_ID;

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ id: string; content: string } | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  // In-memory history for guests (lost on page reload — intentional ephemeral behavior)
  const [guestMessages, setGuestMessages] = useState<LocalMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Load history (authenticated users only) ──────────────────────────────
  useEffect(() => {
    if (!isGuest && id && session?.access_token) {
      fetchRuns(id);
    }
  }, [id, isGuest, fetchRuns, session?.access_token]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    const behavior = isStreaming ? 'auto' : 'smooth';
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior });
    });
  }, [streamingContent, runs, guestMessages, isStreaming]);

  // ─── Crystal candidate detection ──────────────────────────────────────────
  useEffect(() => {
    if (!streamingContent || isGuest) return;
    const CRYSTAL_REGEX = /\[CRYSTAL_CANDIDATE:\s*({[\s\S]*?})\]/m;
    const match = streamingContent.match(CRYSTAL_REGEX);
    if (match?.[1]) {
      try {
        const candidateData = JSON.parse(match[1]);
        setSuggestion((prev) => {
          const currentContent = prev ? JSON.parse(prev.content).content : '';
          if (currentContent !== candidateData.description) {
            return {
              id: 'temp-' + Date.now(),
              content: JSON.stringify({
                content: candidateData.description,
                name: candidateData.name,
                tags: candidateData.tags,
              }),
            };
          }
          return prev;
        });
      } catch {
        // Ignore incomplete JSON during stream
      }
    }
  }, [streamingContent, isGuest]);

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

  // ─── Crystallize (authenticated only) ─────────────────────────────────────
  const handleCrystallize = async () => {
    if (!suggestion || !session?.access_token) return;
    setIsCrystallizing(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/crystallize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ suggestionContent: suggestion.content }),
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
    setOptimisticUserMessage(currentInput);
    setIsStreaming(true);
    setStreamingContent('');

    let fullAssistantResponse = '';

    try {
      // Token is optional — guests send without auth header
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/api/projects/${id}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input: currentInput }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: !done });

        for (const line of chunkValue.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullAssistantResponse += data.content;
                setStreamingContent((prev) => prev + data.content);
              }
            } catch {
              // Ignore broken/non-json chunks
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream failed', err);
    } finally {
      setIsStreaming(false);
      setOptimisticUserMessage(null);
      setStreamingContent('');

      if (isGuest) {
        // Persist messages in local in-memory state for the duration of the session
        const now = new Date().toISOString();
        setGuestMessages((prev) => [
          ...prev,
          { id: `guest-user-${Date.now()}`, role: 'user', content: currentInput, created_at: now },
          ...(fullAssistantResponse
            ? [{ id: `guest-assistant-${Date.now()}`, role: 'assistant', content: fullAssistantResponse, created_at: now }]
            : []),
        ]);
      } else if (id) {
        // Re-sync run history only for authenticated users
        fetchRuns(id);
      }
    }
  };

  // ─── Message display ──────────────────────────────────────────────────────
  // Strip [CRYSTAL_CANDIDATE:...] in all forms — JSON or freetext
  const cleanContent = (text: string) =>
    text.replace(/\[CRYSTAL_CANDIDATE:[\s\S]*?\]/gm, '').trim();

  const storeMessages = runs
    .slice()
    .reverse()
    .flatMap((run) => {
      const msgs = [{ id: `${run.id}-user`, role: 'user', content: run.input, created_at: run.created_at }];
      if (run.output) {
        msgs.push({ id: `${run.id}-assistant`, role: 'assistant', content: run.output, created_at: run.created_at });
      }
      return msgs;
    });

  // Guests use their in-memory list; authenticated users use the store
  const baseMessages: LocalMessage[] = isGuest
    ? guestMessages.map((m) => ({ ...m, content: cleanContent(m.content) }))
    : storeMessages.map((m) => ({ ...m, content: cleanContent(m.content) }));

  const displayMessages = [...baseMessages];

  if (optimisticUserMessage) {
    displayMessages.push({ id: 'optimistic-user', role: 'user', content: optimisticUserMessage, created_at: new Date().toISOString() });
  }

  const cleanedStreamingContent = useMemo(() => cleanContent(streamingContent), [streamingContent]);

  if (isStreaming || (streamingContent && optimisticUserMessage)) {
    displayMessages.push({ id: 'streaming-assistant', role: 'assistant', content: cleanedStreamingContent, created_at: new Date().toISOString() });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans relative">
      <header className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WADI Online</span>
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
            <div className="text-center py-20 text-gray-400">
              <p>Inicia la conversación...</p>
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
                    msg.role === 'user' ? 'bg-gray-50 p-4 rounded-2xl border border-gray-100' : 'text-gray-800 pt-1'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Crystal suggestion — authenticated only */}
                  {!isGuest && msg.role === 'assistant' && suggestion && index === displayMessages.length - 1 && (
                    <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">🚀 Idea Detectada: {JSON.parse(suggestion.content).name}</h4>
                          <p className="text-xs text-blue-700 mt-1">{JSON.parse(suggestion.content).content}</p>
                        </div>
                        <button
                          onClick={handleCrystallize}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                        >
                          {isCrystallizing ? 'Creating...' : 'Crystallize'}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Preguntale algo a WADI..."
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
