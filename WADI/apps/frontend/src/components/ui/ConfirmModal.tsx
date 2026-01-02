import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0f1115] border border-[var(--wadi-glass-border)] rounded-2xl shadow-2xl overflow-hidden animate-enter scale-in border-t border-t-white/10">
        {/* Header Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle className="animate-pulse-slow" size={24} />
          </div>

          {/* Text Content */}
          <h3 className="text-xl font-bold text-white tracking-wide font-['Outfit']">
            {title}
          </h3>
          <p className="text-[var(--wadi-text-secondary)] text-sm leading-relaxed px-4">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--wadi-border)] text-[var(--wadi-text-secondary)] hover:bg-[var(--wadi-surface)] hover:text-white transition-all duration-300 text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Close Button Top Right */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--wadi-text-tertiary)] hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
