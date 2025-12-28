import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "480px",
          // We override card hover behavior just in case, though it defaults false
          transform: "none",
          cursor: "default",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {title && (
          <h3 style={{ marginBottom: "var(--space-4)", fontSize: "1.25rem" }}>
            {title}
          </h3>
        )}
        {children}
      </Card>
    </div>,
    document.body
  );
};
