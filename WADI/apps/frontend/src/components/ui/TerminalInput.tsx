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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 relative mb-6 font-mono">
      {/* File Preview */}
      {selectedFile && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-20">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] px-3 py-1.5 flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-primary)] truncate max-w-[200px]">
              {selectedFile.name} [{(selectedFile.size / 1024).toFixed(0)}KB]
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-[var(--text-secondary)] hover:text-[var(--danger)]"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="w-full"
      >
        <div className="w-full flex items-center bg-[var(--bg-main)] border border-[var(--border-subtle)] focus-within:border-[var(--text-primary)] transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.txt,.md,.pdf,.csv,.json"
          />

          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-r border-[var(--border-subtle)] hover:bg-[var(--bg-panel)]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Comando o instrucción..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm px-4 h-10"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {input.length > 0 && (
            <div className="text-[10px] text-[var(--text-muted)] px-2">
              {input.length}
            </div>
          )}

          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`w-10 h-10 flex items-center justify-center border-l border-[var(--border-subtle)] transition-colors
              ${input.trim() || selectedFile ? "text-[var(--text-primary)] hover:bg-[var(--bg-panel)]" : "text-[var(--text-muted)] cursor-not-allowed"}
            `}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex justify-between mt-1 px-1">
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
            WADI_SYSTEM_READY
          </span>
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
            SECURE_CHANNEL
          </span>
        </div>
      </form>
    </div>
  );
}
