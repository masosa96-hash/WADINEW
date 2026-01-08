import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, verifyOtp, resetPassword, loading } = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isResettingPassword) {
      if (!email) {
        setErrorMsg("Por favor ingresá tu email.");
        return;
      }
      try {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMsg("¡Listo! Si el email existe, recibirás un link para cambiar tu contraseña.");
        setIsResettingPassword(false);
      } catch (err) {
        const error = err as Error;
        setErrorMsg(error.message || "Error al enviar el email de recuperación.");
      }
      return;
    }

    if (needsOtp) {
      if (!otpToken) {
        setErrorMsg("Por favor ingresá el código de 6 dígitos.");
        return;
      }
      try {
        const { error } = await verifyOtp(email, otpToken, isRegistering ? 'signup' : 'login');
        if (error) throw error;
        navigate("/projects");
      } catch (err) {
        const error = err as Error;
        setErrorMsg(error.message || "Código inválido o expirado.");
      }
      return;
    }

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
        const { data, error } = await signUp(email, password, captchaToken);
        if (error) throw error;

        // Cast unknown data to access user/session for confirmation check
        const signupData = data as { user: { id: string } | null; session: { access_token: string } | null };

        // If user is created but not session (needs confirmation)
        if (signupData.user && !signupData.session) {
          setNeedsOtp(true);
          const isPhone = email.startsWith("+") || /^\d+$/.test(email);
          setSuccessMsg(`¡Cuenta creada! Revisá tu ${isPhone ? 'teléfono' : 'email'} para verificarla.`);
        } else {
          navigate("/projects");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/projects");
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Ocurrió un error inesperado.");
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

        {/* MESSAGES */}
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

        {successMsg && (
          <div
            style={{
              background: "rgba(80, 255, 80, 0.1)",
              border: "1px solid rgba(80, 255, 80, 0.3)",
              color: "#6bff6b",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {isResettingPassword ? (
            <Input
              label="Email de recuperación"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
            />
          ) : needsOtp ? (
            <Input
              label="Código de Verificación"
              type="text"
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          ) : (
            <>
              <Input
                label="Email o Teléfono"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com o +54911..."
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

              <button
                type="button"
                onClick={() => setIsResettingPassword(true)}
                style={{
                  alignSelf: "flex-end",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: "-0.5rem",
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            {loading
              ? "Procesando..."
              : isResettingPassword
                ? "Enviar instrucciones"
                : needsOtp
                  ? "Verificar Código"
                  : isRegistering
                    ? "Registrarse"
                    : "Continuar"}
          </Button>

          {(needsOtp || isResettingPassword) && (
            <button
              type="button"
              onClick={() => {
                setNeedsOtp(false);
                setIsResettingPassword(false);
                setSuccessMsg("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                marginTop: "0.5rem",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Volver al formulario
            </button>
          )}
        </form>

        {/* TOGGLE LOGIN/REGISTER */}
        {!needsOtp && (
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
        )}
      </Card>
    </div>
  );
}
