# 🏗 Estructura del Proyecto (WADI Frontend)

Este documento detalla la organización de archivos dentro de `apps/frontend/src`. Mantener esta estructura es vital para la estabilidad del "Núcleo Congelado".

## 📁 `src/`

La raíz del código fuente del cliente web.

### 🧩 `components/`

Elementos visuales de React.

- **`ui/`**: "Átomos" de diseño (botones, inputs, tarjetas). Componentes puros sin lógica de negocio compleja.
  - `MondayButton.tsx`: Botón estándar con estilos WADI.
  - `MondayCard.tsx`: Contenedor tipo tarjeta con efectos glass.
  - `TerminalInput.tsx`: Input principal de chat.
- **`common/`**: Componentes reutilizables de propósito general.
  - `Layout.tsx`: Wrapper principal con fondo y estructura base.
  - `ErrorBoundary.tsx`: Captura de fallos en renderizado.
- **`auditor/`**: (Opcional) Componentes específicos para la lógica de auditoría/negocio de WADI si crecen demasiado.
- **Raíz de components**: Componentes compuestos mayores.
  - `Sidebar.tsx`: Panel lateral de navegación e información.
  - `ChatInterface.tsx`: Contenedor de la lógica de chat.
  - `MessageBubble.tsx`: Visualización de mensajes individuales.

### 🎣 `hooks/`

Lógica de estado y efectos reutilizables.

- `useScouter.ts`: (Dummy) Manejo de audio neutralizado.
- `useScrollToBottom.ts`: Auto-scroll para el chat.

### 📄 `pages/`

Vistas principales gestionadas por el Router.

- `ChatPage.tsx`: Vista principal de interacción.
- `LoginPage.tsx`: (Si existe) Entrada al sistema.

### 📦 `store/`

Gestión de estado global (Zustand).

- `chatStore.ts`: **CRÍTICO**. Maneja mensajes, sesión, gamificación, memoria y comunicación con API.

### 🛠 `lib/` (o `utils/`)

Funciones puras de ayuda.

- `utils.ts`: Formateo de fechas, clases condicionales (cn), validaciones simples.

### 🚦 `router.tsx`

Configuración de React Router. Define qué página se carga en cada URL.

### 🚀 `main.tsx`

Punto de entrada. Monta React en el DOM, registra Service Workers y maneja la inicialización.

---

## 📱 Infraestructura Nativa (Capacitor)

Este proyecto ahora unifica la experiencia móvil en `android/` y `ios/` dentro de `apps/frontend`.

- `capacitor.config.ts`: Configuración del puente nativo.
- `android/`: Proyecto Gradle nativo generado.

## Reglas de Orden

1.  **Colocación**: Si es un botón genérico → `ui/`. Si es específico del chat → `components/`.
2.  **Estado**: Todo el estado global va a `store/`. El estado UI local (ej. input value) se queda en el componente.
3.  **Estilos**: TailwindCSS inline para casi todo. Clases complejas reutilizables en `index.css` via `@apply`.
