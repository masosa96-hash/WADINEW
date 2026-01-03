import { useState, useEffect, useRef } from "react";
import { type Attachment, useChatStore } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";
import { Paperclip, X, Send } from "lucide-react";

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

  // FOCUS LAW: Keep input focused always
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
    // Don't clear state yet, wait for upload success

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
        // UPLOAD TO SUPABASE
        try {
          const uploadedAttachment = await uploadFile(selectedFile);
          if (uploadedAttachment) {
            finalAttachments.push(uploadedAttachment);
          } else {
            // Upload failed
            console.error("Upload failed");
            return; // Abort send
          }
        } catch (err) {
          console.error("Error uploading file", err);
          return; // Abort
        }
      }
    }

    // Clear state only if proceeding
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

  // CLIPBOARD PASTE HANDLER
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault(); // Prevent pasting the "file name" or binary data as text
        const blob = item.getAsFile();
        if (blob) {
          playScanSound();
          setSelectedFile(blob); // React handles converting Blob to File interface mostly fine
        }
        return;
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 relative mb-6">
      {/* File Preview Toolbar */}
      {selectedFile && (
        <div className="absolute -top-16 left-0 right-0 flex justify-center animate-enter z-20">
          <div className="bg-[var(--wadi-surface-active)] backdrop-blur-md border border-[var(--wadi-primary-dim)] shadow-lg rounded-2xl p-2 flex items-center gap-3 pr-4">
            {/* Thumbnail Preview */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border border-white/10">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  width="40"
                  height="40"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Paperclip size={18} className="text-[var(--wadi-primary)]" />
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--wadi-text)] max-w-[150px] truncate">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-[var(--wadi-text-tertiary)] uppercase tracking-wider">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="ml-2 hover:bg-red-500/20 hover:text-red-400 text-[var(--wadi-text-tertiary)] rounded-full p-1.5 transition-colors"
              aria-label="Quitar archivo adjunto"
            >
              <X size={14} />
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
        className="relative w-full group"
      >
        <div
          className={`
          w-full rounded-3xl 
          bg-[var(--wadi-surface)]/90 backdrop-blur-xl 
          text-[var(--wadi-text)] 
          shadow-lg border border-[var(--wadi-glass-border)] 
          px-2 py-2 
          flex items-center gap-2 
          transition-all duration-300 
          focus-within:shadow-[0_0_25px_var(--wadi-primary-dim)] 
          focus-within:border-[var(--wadi-primary-glow)] 
          hover:border-[var(--wadi-border-hover)]
        `}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.txt,.md,.pdf,.csv,.json"
            aria-label="Seleccionar archivo para adjuntar"
          />

          {/* Attach Button */}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-[var(--wadi-text-tertiary)] hover:text-[var(--wadi-primary)] transition-colors rounded-full hover:bg-[var(--wadi-surface-active)]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Adjuntar archivo o imagen"
          >
            <Paperclip size={20} />
          </button>

          {/* Text Input */}
          <input
            id="wadi-user-input"
            name="userInput"
            type="text"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste} // PASTE HANDLER
            placeholder="Escribí tu instrucción (o pegá una imagen)..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--wadi-text)] placeholder:text-[var(--wadi-text-secondary)] text-base font-medium h-10 px-2"
            autoComplete="off"
            aria-label="Ingrese su mensaje al sistema"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Token/Char Counter (Subtle) */}
          <div className="hidden sm:block text-[10px] font-mono text-[var(--wadi-text-tertiary)] opacity-40 select-none mr-2">
            {input.length}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 
              ${
                input.trim() || selectedFile
                  ? "bg-[var(--wadi-primary)] text-white shadow-md hover:scale-105 hover:bg-[var(--wadi-primary-hover)]"
                  : "bg-[var(--wadi-surface-active)] text-[var(--wadi-text-tertiary)] cursor-not-allowed"
              }
            `}
            aria-label="Enviar mensaje a WADI"
          >
            <Send
              size={18}
              className={input.trim() || selectedFile ? "ml-0.5" : ""}
            />
          </button>
        </div>
      </form>
    </div>
  );
}
