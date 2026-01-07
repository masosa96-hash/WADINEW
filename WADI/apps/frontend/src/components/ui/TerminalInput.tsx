import { useState, useEffect, useRef } from "react";
import { type Attachment, useChatStore } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";
import { Paperclip, X, ArrowRight } from "lucide-react";

interface TerminalInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  isLoading: boolean;
  isDecisionBlocked?: boolean;
}

export function TerminalInput({
  onSendMessage,
  isLoading,
}: TerminalInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playScanSound } = useScouter();
  const uploadFile = useChatStore((state) => state.uploadFile);
  const isUploadingStore = useChatStore((state) => state.isUploading);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, input, selectedFile]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading || isUploadingStore)
      return;

    let finalPrompt = input;
    const finalAttachments: Attachment[] = [];
    const prevInput = input;

    if (fileInputRef.current) fileInputRef.current.value = "";
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
          const uploadedAttachment = await uploadFile(selectedFile);
          if (uploadedAttachment) {
            finalAttachments.push(uploadedAttachment);
          } else {
            console.error("Upload failed");
            return;
          }
        } catch (err) {
          console.error("Error uploading file", err);
          return;
        }
      }
    }

    setInput("");
    setSelectedFile(null);

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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          playScanSound();
          setSelectedFile(blob);
        }
        return;
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 relative">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex justify-center animate-enter">
          <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] rounded-[var(--radius-lg)] px-4 py-2 flex items-center gap-3 shadow-lg">
            <Paperclip size={14} className="text-[var(--wadi-primary)]" />
            <span className="text-xs text-[var(--wadi-text)] truncate max-w-[240px] font-medium">
              {selectedFile.name}
            </span>
            <span className="text-xs text-[var(--wadi-text-dim)]">
              {(selectedFile.size / 1024).toFixed(0)}KB
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-[var(--wadi-text-dim)] hover:text-[var(--wadi-danger)] transition-colors ml-2"
              aria-label="Remover archivo"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Pill */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="w-full"
      >
        <div className="w-full flex items-center bg-[var(--wadi-surface-glass)] backdrop-blur-2xl border border-[var(--wadi-border)] rounded-[var(--radius-pill)] transition-all duration-200 focus-within:border-[var(--wadi-primary)] focus-within:ring-2 focus-within:ring-[var(--wadi-primary-ring)] shadow-lg hover:shadow-xl">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.txt,.md,.pdf,.csv,.json"
          />

          {/* Attach Button */}
          <button
            type="button"
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-[var(--wadi-text-dim)] hover:text-[var(--wadi-primary)] transition-colors rounded-l-[var(--radius-pill)]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Adjuntar archivo"
          >
            <Paperclip size={18} />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="¿Qué necesitás?"
            className="flex-1 bg-transparent border-none outline-none text-[var(--wadi-text)] placeholder:text-[var(--wadi-text-dim)] text-sm px-2 h-12 font-[var(--font-sans)]"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Character Count (subtle) */}
          {input.length > 50 && (
            <div className="text-[10px] text-[var(--wadi-text-dim)] px-2 tabular-nums">
              {input.length}
            </div>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-r-[var(--radius-pill)] transition-all duration-200
              ${
                input.trim() || selectedFile
                  ? "text-white bg-[var(--wadi-primary)] hover:bg-[#7c3aed] shadow-md shadow-[var(--wadi-primary-glow)]"
                  : "text-[var(--wadi-text-dim)] cursor-not-allowed"
              }
            `}
            aria-label="Enviar mensaje"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
