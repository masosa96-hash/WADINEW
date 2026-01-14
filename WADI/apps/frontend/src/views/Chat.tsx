import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, User, Bot, Info } from 'lucide-react';
import { useRunsStore } from '../store/runsStore';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { runs, fetchRuns, loading } = useRunsStore();
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchRuns(id);
  }, [id, fetchRuns]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runs, loading, isStreaming, streamingContent]); // Scroll on updates

  const handleSend = async () => {
    if (!input.trim() || !id || loading) return;
    
    // 1. Optimistic UI is handled by state below
    const currentInput = input;
    setInput('');
    
    setIsStreaming(true); // New state needed
    setStreamingContent('');
    setOptimisticUserMessage(currentInput);

    try {
        const response = await fetch(`http://localhost:3000/projects/${id}/runs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: currentInput })
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value, { stream: !done });
            setStreamingContent(prev => prev + chunkValue);
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

  // State for streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<string | null>(null);

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

  const displayMessages = [...storeMessages];
  
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
          content: streamingContent, // This updates in real-time
          created_at: new Date().toISOString()
      });
  }

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans">
      {/* Header sutil con info de Persona */}
      <header className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WADI Online</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-400">
          PERSONA: DINÁMICA
        </div>
      </header>

      {/* Area de Mensajes estilo Gemini */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-3xl mx-auto space-y-12 pb-10">
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
                  {/* Metadata de reflexión */}
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

      {/* Input Flotante estilo ChatGPT/Gemini */}
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
