import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Cpu, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insights?: any[]; // Basado en nuestro contrato JSON
}

const ChatMessage: React.FC<MessageProps> = ({ role, content, insights }) => {
  const isAssistant = role === 'assistant';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group w-full py-8 ${isAssistant ? 'bg-wadi-gray-50/50' : 'bg-white'}`}
    >
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        {/* Avatar Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isAssistant ? 'bg-wadi-black text-white' : 'bg-wadi-gray-200 text-wadi-gray-600'
        }`}>
          {isAssistant ? <Cpu size={16} /> : <User size={16} />}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4 overflow-hidden">
          <p className="text-[10px] font-bold text-wadi-gray-400 uppercase tracking-widest">
            {isAssistant ? 'WADI Engine' : 'You'}
          </p>
          
          <div className="prose prose-sm max-w-none text-wadi-gray-900 leading-relaxed font-wadi-sans">
            <ReactMarkdown
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                code({ inline, className, children, ...props }: any) {
                  return !inline ? (
                    <div className="relative my-4 rounded-xl overflow-hidden border border-wadi-gray-200">
                      <div className="flex items-center justify-between px-4 py-2 bg-wadi-gray-900 text-wadi-gray-400 text-[10px] font-wadi-mono">
                        <span>SOURCE CODE</span>
                        <Copy size={12} className="cursor-pointer hover:text-white" />
                      </div>
                      <pre className="p-4 bg-wadi-black text-wadi-gray-100 overflow-x-auto font-wadi-mono text-xs">
                        {children}
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-wadi-gray-100 text-wadi-accent-start px-1.5 py-0.5 rounded font-wadi-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Renderizado de Insights si existen (Data del contrato JSON) */}
          {insights && insights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {insights.map((insight, idx) => (
                <span key={idx} className="px-2 py-1 bg-wadi-accent-start/10 border border-wadi-accent-start/20 text-wadi-accent-start text-[10px] font-bold rounded-md uppercase">
                  ⚡ {insight.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
