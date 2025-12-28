import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: "#111827",
        backgroundColor: "#F5F7FB",
        minHeight: "100vh",
        padding: "4rem 2rem",
      }}
    >
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "2rem",
            background: "transparent",
            border: "none",
            color: "#7C6CFF",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Volver al inicio
        </button>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "2rem",
            color: "#111827",
          }}
        >
          Política de Privacidad de WADI
        </h1>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            1. Datos que procesamos
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Procesamos el contenido de las conversaciones que mantienes con WADI
            para generar respuestas. También recopilamos datos técnicos básicos
            necesarios para el funcionamiento del servicio, como dirección IP y
            metadatos de uso, únicamente con fines de seguridad y mejora del
            servicio.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            2. Uso de la información
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Utilizamos la información para:
          </p>
          <ul
            style={{
              lineHeight: 1.6,
              color: "#4B5563",
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "0.5rem",
            }}
          >
            <li>Proveer y mantener el servicio operativo.</li>
            <li>Generar respuestas contextualizadas a tus consultas.</li>
            <li>Mejorar la calidad de nuestro modelo y herramientas.</li>
            <li>Garantizar la seguridad de la plataforma.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            3. Compartición de datos
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            No vendemos tus datos personales. Compartimos información
            estrictamente necesaria con proveedores de infraestructura (como
            servicios de hosting y proveedores de modelos de lenguaje) que
            operan bajo acuerdos de confidencialidad. También podemos divulgar
            información si así lo exige la ley.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            4. Retención y eliminación
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Mantenemos los datos mientras tu cuenta esté activa o sea necesario
            para prestar el servicio. Puedes solicitar la eliminación de tu
            cuenta y datos asociados en cualquier momento contactándonos.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            5. Seguridad
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Implementamos medidas de seguridad técnicas y organizativas para
            proteger tus datos contra el acceso no autorizado, la pérdida o la
            alteración.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            6. Derechos del usuario
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Tienes derecho a acceder, corregir y eliminar tus datos personales.
            Para ejercer estos derechos, contáctanos en:{" "}
            <a
              href="mailto:privacidad@wadi.app"
              style={{ color: "#7C6CFF", fontWeight: 600 }}
            >
              privacidad@wadi.app
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            7. Uso con menores
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            WADI no está dirigido a menores de 13 años. No recopilamos
            intencionalmente información personal de niños menores de esta edad.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            8. Cambios en la política
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Podemos actualizar esta política ocasionalmente. Notificaremos los
            cambios publicando la nueva política en esta página.
          </p>
          <p
            style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6B7280" }}
          >
            Última actualización: Diciembre 2025
          </p>
        </section>
      </main>
    </div>
  );
}
