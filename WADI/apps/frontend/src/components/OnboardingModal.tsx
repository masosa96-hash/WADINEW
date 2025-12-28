import { Button } from "./common/Button";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--color-bg)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "flex-start", // Left align as per "serious" look usually, but centering might be better for intro. Let's try centered for focus.
          textAlign: "left", // Actually, serious text looks good left-aligned often, but let's stick to a clean centered or left layout.
          // User didn't specify alignment, but "Copy textual" suggests reading.
          // Let's center the container but maybe left align text for readability?
          // "Título: WADI no charla..." - Centered is probably safer for a splash screen.
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: "1.1",
              margin: 0,
              background: "var(--grad-main)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            WADI no charla.
            <br />
            Piensa con vos.
          </h1>

          <div
            style={{
              fontSize: "1.1rem",
              color: "var(--color-text-soft)",
              lineHeight: "1.6",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <p style={{ margin: 0 }}>No hace magia.</p>
            <p style={{ margin: 0 }}>No valida ideas flojas.</p>
            <p style={{ margin: 0 }}>
              Si algo está desordenado, lo ordena avanzando.
            </p>
          </div>
        </div>

        <div
          style={{ width: "100%", borderTop: "1px solid var(--color-border)" }}
        />

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--color-text-main)",
              fontWeight: 500,
            }}
          >
            Escribí lo primero que tengas. Aunque esté mal.
          </p>

          <Button
            variant="primary"
            onClick={onComplete}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "1rem",
              fontSize: "1.1rem",
            }}
          >
            Empezar
          </Button>
        </div>
      </div>
    </div>
  );
}
