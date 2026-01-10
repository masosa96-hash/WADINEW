import { useState } from 'react';

function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Point this to your actual API URL
  // If running locally, usually http://localhost:3000/chat or similar
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Adjust this based on your actual API response structure
      // Expected: { response: "string" } or { message: "string" }
      const assistantMsg = { role: 'assistant' as const, content: data.response || data.message || JSON.stringify(data) };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to brain.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
      <h1>WADI Brain (Raw)</h1>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? '#007bff' : '#333',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}>
            <strong>{msg.role === 'user' ? 'You' : 'WADI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div>Thinking...</div>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, padding: '0.5rem' }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
