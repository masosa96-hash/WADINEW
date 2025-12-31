# 📍 ROADMAP DE CIERRE – WADI v4.0

Este roadmap congela la arquitectura actual y define los pasos finales para consolidar el proyecto como un sistema funcional, estable y extensible.

---

## ✅ Núcleo Congelado – No Tocar

Estos elementos ya están implementados y no deben ser modificados salvo mantenimiento menor:

- Prompt / Personalidad WADI (`wadi-brain.js`)
- chatStore.ts (estado, memoria, puntos, rangos, reset)
- API backend (Node + Express + Supabase)
- Estilo visual WADI (Deep Bunker, glass, lavanda y azul oscuro)
- Navegación (React Router)
- Crystallize Project (conversación → projects)
- UI general (`Layout`, `ChatPage`, `Sidebar`, `TerminalInput`)

---

## 🧩 Tareas Pendientes Fase 4.0

### 1. 📁 Estructura y Documentación

- [ ] Crear `docs/ESTRUCTURA.md` explicando cada carpeta en `apps/frontend`
- [ ] Agregar `README.md` en `apps/frontend` con contexto técnico y visual
- [ ] Agregar `README.md` en `apps/kivo` explicando su rol como "otra voz"
- [ ] Crear `docs/PERSONALIDADES.md` con descripción de X (Kivo) e Y (WADI)

### 2. 📱 Interfaz y Visual QA

- [ ] Test completo en móvil (375px y similares)
- [ ] Confirmar funcionamiento táctil de:
  - Botón CRISTALIZAR
  - TerminalInput
  - Sidebar
  - Scroll automático al enviar
- [ ] Ajustes visuales mínimos para compatibilidad móvil

### 3. 📦 apps/kivo (Estado de Modo X)

- [ ] Evaluar: migrar a React + Tailwind o mantener como contenedor separado
- [ ] Si se mantiene: limpiar código legacy (JS vanilla + Firebase)
- [ ] Si se migra: crear `apps/mobile` compartiendo lógica de `frontend`

### 4. 🧼 Seguridad y Auth

- [ ] Definir si habrá múltiples usuarios o solo uso interno
- [ ] Si múltiples:
  - [ ] Implementar roles en Supabase (admin, user)
  - [ ] Agregar policies para proteger acceso a datos (projects, chats)
- [ ] Si uso personal:
  - [ ] Proteger endpoints críticos con token estático o validación manual

### 5. 🎨 Diseño Final Congelado

- [ ] Congelar estilo de:
  - MessageBubble
  - TerminalInput
  - Sidebar (signos vitales)
  - Estados especiales (inicio, error, sin mensajes, cristalizado)
- [ ] Crear `wadi-theme.ts` con colores, tipografía y variables CSS centrales

---

## 📦 Recomendaciones de Mejora Futuras

(No urgentes, pero útiles en V5.0+)

- Agregar opción para exportar sesiones a PDF o Markdown
- Soporte para compartir conversación pública
- Selector de personalidad en UI (X o Y)
- Rol observador sin edición para equipos
- Mini-dashboard con métricas de uso (conversaciones, puntos, cristalizaciones)

---

> Todo lo aquí definido forma parte del sello de arquitectura estable del sistema WADI. Nada se avanza hasta que esto esté cerrado.
