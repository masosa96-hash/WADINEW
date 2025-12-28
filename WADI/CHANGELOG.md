<!-- markdownlint-disable MD024 -->

# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
This project _intentionally_ does not follow Semantic Versioning.  
We do what we want.

---

## [2.0.0] - 2025-12-28

### Added

- **WADI CLI**: Herramienta de línea de comando local (`cli/`) para gestión del proyecto.
- **CI/CD**: Workflow de GitHub Actions (`wadi-ci.yml`) para linting y build automático.
- **Documentación Interna**: Nueva guía de onboarding `docs/USO.md`.
- **Infraestructura**: Configuración preparada para dominios personalizados en `docs/CNAME`.

## [1.0.0] - 2025-12-28

### Added

- Sistema de branding completo para WADI.
- Tema visual "Deep Bunker" aplicado a toda la interfaz.
- Documentación inicial (`README.md`) terminada.
- Entrada de terminal funcional (TerminalInput.tsx).
- Backend `wadi-brain.js` con motor de respuesta contextual.
- Limpieza total de código no usado (bye `useChatStore`, `playTone`, etc).
- Favicon personalizado (`wadi.svg`).

### Removed

- Componentes basura como "Brainstorming", "Plan de Negocio", etc.
- Todas las referencias a "Monday".
- Sonido. Todo. Absolutamente todo.

### Fixed

- Warnings de ESLint en componentes clave.
- `useEffect` con dependencias faltantes en Sidebar.
- Form inputs sin `id` o `name`.

---

## [UNRELEASED]

Things that _will probably break everything_ if you’re not careful:

### Planning

- Modo de contexto persistente (¿state manager o base de datos?).
- Integración con APIs externas (OpenAI, Langchain, HuggingFace, etc).
- WADI con personalidad dinámica (modo irónico, formal, técnico, etc).
