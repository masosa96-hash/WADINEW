import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor completá todos los campos.");
      return;
    }

    try {
      if (isRegistering) {
        if (!captchaToken) {
          setErrorMsg("Por favor completá el CAPTCHA.");
          return;
        }
        const { error } = await signUp(email, password, captchaToken);
        if (error) throw error;
        navigate("/projects");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/projects");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
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
        {/* LOGO / BRAND */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              margin: 0,
            }}
          >
            WADI
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            {isRegistering ? "Creá tu cuenta" : "Bienvenido de nuevo"}
          </p>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(255, 80, 80, 0.1)",
              border: "1px solid rgba(255, 80, 80, 0.3)",
              color: "#ff6b6b",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {isRegistering && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <HCaptcha
                sitekey={
                  import.meta.env.VITE_HCAPTCHA_SITE_KEY ||
                  "10000000-ffff-ffff-ffff-000000000001"
                }
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            {loading
              ? "Procesando..."
              : isRegistering
                ? "Registrarse"
                : "Continuar"}
          </Button>
        </form>

        {/* TOGGLE LOGIN/REGISTER */}
        <div
          style={{
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          {isRegistering ? "¿Ya tenés cuenta? " : "¿No tenés cuenta? "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg("");
              setCaptchaToken(""); // Reset captcha on toggle
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-primary)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {isRegistering ? "Iniciar Sesión" : "Registrate"}
          </button>
        </div>
      </Card>
    </div>
  );
}
