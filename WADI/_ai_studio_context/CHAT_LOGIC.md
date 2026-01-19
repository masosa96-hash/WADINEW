# CHAT LOGIC (Stream & Crystallization)

**Archivo:** `apps/frontend/src/views/Chat.tsx`

```tsx
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

  // --- PROJECT CRYSTALLIZATION LOGIC ---
  const [suggestion, setSuggestion] = useState<{ id: string, content: string } | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);

  useEffect(() => {
    if (id && session?.access_token) fetchRuns(id);
  }, [id, fetchRuns, session?.access_token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runs, loading, isStreaming, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || !id || loading) return;

    const currentInput = input;
    setInput('');
    
    setOptimisticUserMessage(currentInput);
    setIsStreaming(true);
    setStreamingContent('');

    try {
        const { data: { session } } = await supabase.auth.getSession();
        let token = session?.access_token;
        if (!token) token = useAuthStore.getState().session?.access_token;
        if (!token) throw new Error("No token");
        
        const response = await fetch(`${API_URL}/projects/${id}/runs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
            
            const lines = chunkValue.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.content) {
                            setStreamingContent(prev => prev + data.content);
                        }
                    } catch {}
                }
            }
        }
        
    } catch (err) {
        console.error("Stream failed", err);
    } finally {
        setIsStreaming(false);
        setOptimisticUserMessage(null);
        setStreamingContent('');
        fetchRuns(id);
    }
  };

  // --- MARKET DETECTOR (HACK HERE) ---
  useEffect(() => {
    if (!streamingContent) return;

    // AQUI ES DONDE INTERCEPTAMOS LA ETIQUETA
    const match = streamingContent.match(/\[CRYSTAL_CANDIDATE:\s*({.*?})\]/);
    if (match && match[1]) {
        try {
            const candidateData = JSON.parse(match[1]);
            setSuggestion({
                id: 'temp-' + Date.now(),
                content: JSON.stringify({ 
                    content: candidateData.description, 
                    name: candidateData.name, 
                    tags: candidateData.tags 
                })
            });
        } catch (e) {
            console.error("Failed to parse crystal candidate", e);
        }
    }
  }, [streamingContent]);

  // Clean displayed messages from the marker
  const cleanContent = (text: string) => {
      let cleaned = text.replace(/\[CRYSTAL_CANDIDATE:[\s\S]*$/, '');
      cleaned = cleaned.trim();
      while (cleaned.endsWith('}') || cleaned.endsWith(']')) {
          cleaned = cleaned.slice(0, -1).trim();
      }
      return cleaned;
  };
 
  // ... Render Logic (UI, Bubbles, Suggestion Card) ...
}
```
