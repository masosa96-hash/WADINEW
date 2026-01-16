import { useState, useEffect, useRef } from 'react';
import { API_URL } from "../config/api";
import { useParams } from 'react-router-dom';
import { Send, User, Bot, Info } from 'lucide-react';
import { useRunsStore } from '../store/runsStore';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { runs, fetchRuns, loading } = useRunsStore();
  const { session } = useAuthStore();
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // State for streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id && session?.access_token) fetchRuns(id);
  }, [id, fetchRuns, session?.access_token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runs, loading, isStreaming, streamingContent]); // Scroll on updates

  const handleSend = async () => {
    if (!input.trim() || !id || loading) return;

    const currentInput = input;
    setInput('');
    
    // UI OPTIMISTA: El mensaje del usuario aparece YA
    setOptimisticUserMessage(currentInput);
    setIsStreaming(true);
    setStreamingContent('');

    // Creamos un mensaje vacío para WADI que se irá llenando visualmente
    // En nuestra implementación, usamos hasStreamingContent + displayMessages para esto.

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const response = await fetch(`${API_URL}/projects/${id}/runs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ input: currentInput })
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value, { stream: !done });
            
            // Parse SSE data lines (data: {...})
            const lines = chunkValue.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.content) {
                            // Check for marker in the accumulated content + new chunk
                            const newContent = data.content;
                            // We construct the full content to check, but setting state is additive
                            // logic is complex inside a loop. 
                            // Easier: Just append to streamingContent, and let a useEffect handle parsing.
                            setStreamingContent(prev => prev + newContent);
                        }
                    } catch {
                        // ignore broken chunks or non-json
                    }
                }
            }
        }
        
    } catch (err) {
        console.error("Stream failed", err);
    } finally {
        setIsStreaming(false);
        setOptimisticUserMessage(null);
        setStreamingContent('');
        fetchRuns(id); // Re-sync with authoritative DB
    }
  };


  // Merge Store Messages + Optimistic/Streaming Message
  // ... existing transformation logic ...
  const storeMessages = runs.slice().reverse().flatMap((run) => {
        const msgs = [];
        msgs.push({
            id: `${run.id}-user`,
            role: 'user',
            content: run.input,
            created_at: run.created_at
        });
        if (run.output) {
            msgs.push({
                id: `${run.id}-assistant`,
                role: 'assistant',
                content: run.output, // Now plain text from DB
                created_at: run.created_at
            });
        }
        return msgs;
  });

  // --- MARKET DETECTION EFFECT ---
  useEffect(() => {
    if (!streamingContent) return;

    // Regex to find [CRYSTAL_CANDIDATE: {...}]
    const match = streamingContent.match(/\[CRYSTAL_CANDIDATE:\s*({.*?})\]/);
    if (match && match[1]) {
        try {
            const candidateData = JSON.parse(match[1]);
            // Only set if not already set to avoid loops, though strict mode might trigger twice
            setSuggestion({
                id: 'temp-' + Date.now(), // Client-side ID until saved
                content: JSON.stringify({ 
                    content: candidateData.description, 
                    name: candidateData.name, 
                    tags: candidateData.tags 
                }) // Matching the expected format for the existing UI
            });
        } catch (e) {
            console.error("Failed to parse crystal candidate", e);
        }
    }
  }, [streamingContent]);

  // Clean displayed messages from the marker
  // Clean displayed messages from the marker
  // IMPROVED REGEX: Matches from the tag start until the very end of the string to avoid nested bracket issues.
  const cleanContent = (text: string) => {
      // Option 1: Remove if it appears at the end
      return text.replace(/\[CRYSTAL_CANDIDATE:[\s\S]*$/, '').trim();
  };

  const displayMessages = [...storeMessages.map(m => ({...m, content: cleanContent(m.content)}))];
  
  if (optimisticUserMessage) {
      displayMessages.push({
          id: 'optimistic-user',
          role: 'user',
          content: optimisticUserMessage,
          created_at: new Date().toISOString()
      });
  }
  
  if (isStreaming || (streamingContent && optimisticUserMessage)) { // Show assistant bubble if streaming
      displayMessages.push({
          id: 'streaming-assistant',
          role: 'assistant',
          content: cleanContent(streamingContent), // Cleaned visual content
          created_at: new Date().toISOString()
      });
  }

  // --- PROJECT CRYSTALLIZATION LOGIC ---
  const [suggestion, setSuggestion] = useState<{ id: string, content: string } | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);

  useEffect(() => {
    const checkSuggestions = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const response = await fetch(`${API_URL}/projects/suggestions/pending`, {
                 headers: { 
                     'Content-Type': 'application/json',
                     ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                 }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                     // Check if we haven't dismissed it
                     const sugg = data[0];
                     if (sugg.id !== localStorage.getItem('last_dismissed_suggestion')) {
                         setSuggestion(sugg);
                     }
                }
            }
        } catch {
             // Ignore network errors during polling
        }
    };
    
    const interval = setInterval(checkSuggestions, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCrystallize = async () => {
      if (!suggestion) return;
      setIsCrystallizing(true);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          const res = await fetch(`${API_URL}/projects/crystallize`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ suggestionContent: suggestion.content })
          });
          if (res.ok) {
              const data = await res.json();
              console.log(`Proyecto "${data.project.name}" creado!`); // Replaced alert
              setSuggestion(null);
              localStorage.setItem('last_dismissed_suggestion', suggestion.id);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsCrystallizing(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans relative">
      {/* ... header ... */}
      <header className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WADI Online</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-400">
          PERSONA: DINÁMICA
        </div>
      </header>

      {/* Area de Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-3xl mx-auto space-y-12 pb-10">
           {/* ... messages ... */}
          {displayMessages.length === 0 && (
             <div className="text-center py-20 text-gray-400">
                <p>Inicia la conversación...</p>
             </div>
          )}

          {displayMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="space-y-2">
                  <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gray-50 p-4 rounded-2xl border border-gray-100' : 'text-gray-800 pt-1'}`}>
                     <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 items-center opacity-0 hover:opacity-100 transition-opacity">
                      <button className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        <Info size={10} /> Análisis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
             <div className="flex gap-4 max-w-[90%] justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                   <Bot size={16} className="text-blue-600" />
                </div>
                <div className="space-y-2 pt-2">
                   <div className="h-4 w-24 bg-gray-100 rounded"></div>
                   <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
             </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Suggestion Card */}
      {suggestion && (
          <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center px-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="bg-white border border-blue-100 shadow-xl rounded-xl p-4 max-w-lg w-full flex items-center gap-4 ring-1 ring-blue-50">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-lg">💡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">Proyecto Detectado</h4>
                      <p className="text-xs text-gray-500 truncate">{JSON.parse(suggestion.content).content || "Nueva idea de negocio"}</p>
                  </div>
                  <div className="flex gap-2">
                      <button 
                         onClick={() => {
                             setSuggestion(null);
                             localStorage.setItem('last_dismissed_suggestion', suggestion.id);
                         }}
                         className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                          Ignorar
                      </button>
                      <button 
                         onClick={handleCrystallize}
                         disabled={isCrystallizing}
                         className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                          {isCrystallizing ? 'Cristalizando...' : 'Crear Proyecto'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Input Flotante */}
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
            disabled={loading}
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
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
};
