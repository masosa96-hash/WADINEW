# 🧠 WADI Frontend (Y)

Esta es la implementación principal de **WADI** ("Y"), la interfaz de escritorio enfocada en eficiencia técnica y honestidad brutal.

---

## 🏗 Arquitectura Técnica

- **Framework:** React 18 + TypeScript.
- **Build Tool:** Vite.
- **Estilos:** TailwindCSS (con variables CSS para temas dinámicos).
- **Estado:** Zustand (`chatStore.ts`) con persistencia local.
- **Routing:** React Router DOM.
- **Iconos:** Lucide React.
- **PWA:** Service Worker registrado para funcionamiento offline básico.

---

## 🎨 Identidad Visual "Deep Bunker"

El diseño sigue una estricta paleta de colores oscuros para minimizar la fatiga visual en sesiones nocturnas.

- **Fondo:** Gradiente radial profundo (`#1a1d26` a `#0f1115`).
- **Acento:** Lavanda (`#8b5cf6`) para indicar la "presencia" de la IA.
- **Superficies:** Glassmorphism con alta transparencia y desenfoque (`backdrop-blur-xl`).
- **Tipografía:** `Outfit` (sans-serif moderna) para UI, `JetBrains Mono` para código.

---

## 🧩 Componentes Clave

1. **`ChatStore`**: El cerebro del frontend. Controla no solo los mensajes, sino el "Rango de Eficiencia" del usuario, la memoria de proyectos y la conexión con la API y Supabase.
2. **`TerminalInput`**: No es un simple textarea. Es una consola de comandos camuflada. Soporta entrada multinlínea y gestión de estados de carga.
3. **`WadiBrain` (Lógica remota)**: Aunque vive en el backend, el frontend renderiza las respuestas "cínicas" y procesa comandos especiales como `[CRISTALIZAR]`.

---

## 🚀 Scripts Disponibles

- `npm run dev`: Inicia servidor de desarrollo.
- `npm run build`: Genera bundle de producción en `dist/`.
- `npm run lint`: Verifica calidad de código.
- `npm run preview`: Previsualiza el build de producción.

---

> _"No busques validación aquí. Busca resultados."_ — WADI
