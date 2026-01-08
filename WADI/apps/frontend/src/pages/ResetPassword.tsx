import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword, loading, user } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Supabase takes the user to this page with an access_token in the URL fragment
  // The AuthStore initializeAuth should pick it up automatically.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setSuccessMsg("¡Contraseña actualizada con éxito!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Error al actualizar la contraseña.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase" }}>
            Nueva Contraseña
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Ingresá tu nueva clave de acceso al búnker
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: "rgba(255, 80, 80, 0.1)", color: "#ff6b6b", padding: "10px", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: "rgba(80, 255, 80, 0.1)", color: "#6bff6b", padding: "10px", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Nueva Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
