import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IntroWadi() {
  const [visible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const alreadySeen = localStorage.getItem("wadi_intro_seen");
    if (alreadySeen) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleContinue = () => {
    localStorage.setItem("wadi_intro_seen", "true");
    navigate("/chat");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "2.5rem 1.5rem",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        WADI no charla por charlar. WADI ordena mientras piensa.
      </h1>

      <div style={{ flex: 1, overflowY: "auto", fontSize: "0.875rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          ⚠️ Esto no es una IA simpática. Tampoco es fría.
        </p>
        <p style={{ marginBottom: "1rem" }}>
          Vas a hablar con una herramienta que:
        </p>

        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <li>Te devuelve estructura cuando estás en el aire.</li>
          <li>Te acompaña si traés algo real.</li>
          <li>No valida sin criterio.</li>
          <li>No te deja evadir decisiones.</li>
          <li>Piensa con vos, no por vos.</li>
        </ul>

        <p
          style={{
            marginTop: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          Qué frases podés esperar:
        </p>
        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <li>“Esto es mezcla. Hay dos líneas: A o B. Elegí.”</li>
          <li>“Podemos seguir con esto, pero está flojo.”</li>
          <li>“No hay foco acá. ¿Querés seguir igual o cambiar?”</li>
        </ul>

        <p style={{ marginBottom: "1rem" }}>
          WADI va a sostener tu pensamiento, no tu zona de confort. Pero no te
          deja solo si traés algo vivo.
        </p>

        <p style={{ marginTop: "1rem", color: "#FACC15", fontWeight: "600" }}>
          Si seguís, entrás en una conversación lúcida. Y no hay vuelta atrás.
        </p>
      </div>

      <button
        onClick={handleContinue}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: "0.5rem",
          fontWeight: "bold",
          fontSize: "0.875rem",
          cursor: "pointer",
          border: "none",
          width: "100%",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#FDE047")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
      >
        Entiendo. Vamos a ordenar.
      </button>
    </div>
  );
}
