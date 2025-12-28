import { useState, useEffect, useRef } from "react";
import { useChatStore, type Attachment } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";
import { Send, Paperclip, X } from "lucide-react"; // Using lucid-react icons if available, else svgs

// Fallback icons if lucide not imported/working in this context, but user mentioned "iconos minimalistas"
const IconSend = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconAttach = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

interface TerminalInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  isLoading: boolean;
  isDecisionBlocked?: boolean;
  activeFocus?: string | null;
}

export function TerminalInput({
  onSendMessage,
  isLoading,
  activeFocus,
}: TerminalInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playScanSound } = useScouter();

  // FOCUS LAW: Keep input focused always
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, input, selectedFile]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    let finalPrompt = input;
    const finalAttachments: Attachment[] = [];

    const prevInput = input;
    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Force focus back
    if (inputRef.current) inputRef.current.focus();

    if (selectedFile) {
      const isText =
        selectedFile.type.startsWith("text/") ||
        selectedFile.name.endsWith(".md") ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".json");

      if (isText) {
        try {
          const textContent = await selectedFile.text();
          finalPrompt += `\n\n[ARCHIVO IMPLÍCITO: ${selectedFile.name}]\n---\n${textContent}\n---`;
        } catch (err) {
          console.error("Error reading text file", err);
        }
      } else {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          finalAttachments.push({
            url: base64,
            name: selectedFile.name,
            type: selectedFile.type,
          });
        } catch (err) {
          console.error("Error converting file to base64", err);
        }
      }
    }

    try {
      await onSendMessage(finalPrompt, finalAttachments);
    } catch (err) {
      console.error("Send failed", err);
      setInput(prevInput);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playScanSound();
    setSelectedFile(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 relative mb-6">
      {/* File Preview Capsule */}
      {selectedFile && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white/90 backdrop-blur border border-purple-100 shadow-sm rounded-full px-4 py-1 flex items-center gap-2 text-xs text-purple-600 font-medium">
            <Paperclip size={12} className="opacity-50" />
            <span>{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="ml-2 hover:bg-purple-50 rounded-full p-1 transition-colors"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Main Input Capsule */}
      <form onSubmit={handleSend} className="relative w-full">
        <div className="neo-capsule flex items-center gap-2 pr-2 overflow-hidden">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.txt,.md,.pdf,.csv,.json"
          />

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-purple-500 transition-colors rounded-full hover:bg-purple-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <IconAttach />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeFocus
                ? "Estamos en un foco activo. ¿Qué opinás?"
                : "Pregunta o instruye a Monday..."
            }
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium h-full min-h-[24px]"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`p-2 rounded-full transition-all duration-300 ${
              input.trim() || selectedFile
                ? "bg-[var(--monday-primary)] text-white shadow-md hover:scale-105"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            <IconSend />
          </button>
        </div>
      </form>
    </div>
  );
}
