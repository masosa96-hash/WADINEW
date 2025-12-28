# 🧠 WADI — Asistente de Desarrollo e Infraestructura

![WADI Status](https://img.shields.io/badge/status-EN%20LÍNEA-brightgreen?style=flat-square&logo=github)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/masosa96-hash/WADINEW/wadi-ci.yml?branch=master&label=CI&style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

**Versión:** 1.0  
**Identidad:** WADI  
**Estado:** Completamente operativo y en línea.  
**Modo Visual:** Tema `Deep Bunker` (Dark Mode activado por defecto)

---

## 📋 Descripción

**WADI** es un asistente técnico diseñado para ambientes de desarrollo modernos. Su objetivo:  
_resolver problemas complejos con precisión técnica y honestidad brutal_, sin ruido, sin validaciones forzadas, sin efectos de sonido innecesarios.

> "WADI no es tu amigo. Es tu herramienta. Brutal, eficiente, y siempre funcional."

---

## 🚀 Capacidades

- **Interfaz Terminal:** Chat con entrada optimizada para comandos y texto técnico.
- **Respuesta Contextual:** Motor `wadi-brain.js` con prompt personalizado.
- **Modo Oscuro Profundo:** Estética 'Deep Bunker' (`#0f111a`) para sesiones largas.
- **Estructura de UI Limpia:** Sidebar reactivo, Layout minimalista.
- **Soporte de Comandos:** Integración de comandos desde el frontend hacia el backend.
- **Silencio Total:** Sistema de audio neutralizado por diseño (funciones dummy).

---

## 🛠 Entorno Técnico

| Área          | Tecnología                                                       |
| ------------- | ---------------------------------------------------------------- |
| **Frontend**  | React + TypeScript + Vite                                        |
| **Estilos**   | TailwindCSS + CSS Variables (`--wadi-*`)                         |
| **Backend**   | Node.js + Express (`wadi-brain.js`)                              |
| **Ruta base** | `ChatPage.tsx`, `Sidebar.tsx`, `Layout.tsx`, `TerminalInput.tsx` |

---

## 🔐 Restricciones del Sistema

1. **Branding Unificado:** No hay referencias a la identidad anterior ("Monday").
2. **Audio Nulo:** No se cargan ni ejecutan sonidos.
3. **Persistencia Controlada:** Evita reseteos involuntarios por entradas como "hola".
4. **Código Higiénico:** Linter limpio. Sin variables sin usar.
5. **Accesibilidad Básica:** Todos los `input` tienen `id` y `name` definidos.

---

## 🧃 Filosofía

- No valida emociones. Valida `props`.
- No suena. Responde.
- No se reinicia por cualquier "hola".
- No pregunta si querés ayuda. Te la da (cuando la merecés).

---

## 📦 Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar el entorno de desarrollo
npm run dev
```

### 📁 Estructura Relevante

```text
apps/
  frontend/
    src/
      components/
        ui/
          TerminalInput.tsx       # Input de terminal WADI
          MondayButton.tsx        # Botón reutilizable
          MondayCard.tsx          # Tarjetas estilizadas
        Sidebar.tsx               # Navegación lateral
        Layout.tsx                # Layout principal
        MessageBubble.tsx         # Mensajes del chat
      hooks/
        useScouter.ts             # Audio neutralizado (dummy)
      pages/
        ChatPage.tsx              # Página principal
    index.css                     # Tema 'Deep Bunker'
    index.html                    # Favicon y meta
  api/
    src/
      wadi-brain.js               # Motor principal de respuesta
```

### 🧪 Estado de QA

- [x] Branding aplicado (WADI)
- [x] Componentes eliminados (Brainstorming, etc.)
- [x] Tema oscuro funcional
- [x] Lint sin errores
- [x] Audio neutralizado
- [x] Input accesible (id y name)
- [x] Favicon personalizado (wadi.svg)
- [x] No más Monday

### 🧠 Changelog

#### v1.0 - Inicial

- Reemplazo total de identidad visual y funcional.
- Rediseño de UI con tema oscuro.
- Refactor de componentes y limpieza de código.
- Implementación de lógica WADI-brain para respuestas contextuales.
- Elimincación de sonido y elementos innecesarios.

---

---

[🧾 Contributing](CONTRIBUTING.md) • [📜 Code of Conduct](CODE_OF_CONDUCT.md)

Made with 🧠 by un desarrollador que claramente odia el ruido.
