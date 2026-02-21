# WADI

![WADI Status](https://img.shields.io/badge/status-EN%20LÍNEA-brightgreen?style=flat-square&logo=github)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/masosa96-hash/WADINEW/wadi-ci.yml?branch=master&label=CI&style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

**AI Co-Founder para Builders.**

WADI es un asistente de IA orientado a proyectos que transforma ideas caóticas en planes estructurados y accionables. Diseñado para founders e indie hackers que necesitan claridad estratégica y ejecución, no solo respuestas.

> No es un chatbot genérico.  
> Es un sistema de pensamiento estructurado.

---

## ¿Para quién?

| | |
|---|---|
| **Perfil primario** | Indie hackers · Founders técnicos · Builders de SaaS |
| **Edad** | 20–40 años |
| **Problema** | Saturación mental, falta de estructura, ideas que no se convierten en proyectos |
| **Por qué WADI** | ChatGPT responde preguntas. WADI estructura proyectos. |

---

## Diferenciación

| Herramienta | Qué hace bien | Qué no hace |
|---|---|---|
| ChatGPT / Claude | Responden bien | No estructuran proyectos persistentes con intención estratégica |
| Notion AI | Ayuda con texto | No piensa con vos, no detecta ideas |
| Perplexity | Excelente para research | No organiza ejecución |
| **WADI** | Estructura proyectos · Crystallize · Personalidades estratégicas | — |

---

## Features

- **Proyectos con contexto persistente** — cada proyecto tiene su propio hilo de pensamiento
- **Crystallize** — detección automática de ideas con potencial y conversión a proyectos
- **Personalidades estratégicas** — EJECUCION, CALMA, IRONICO, SERIO según el contexto
- **Guest mode** — sesión efímera sin registro, igual que ChatGPT
- **Streaming** — respuestas en tiempo real via SSE

---

## Stack

```
Frontend:  React + TypeScript + Vite (Render)
Backend:   Node.js + Express + TypeScript (Render)
DB:        Supabase (Postgres + Auth + Realtime + Storage)
LLM:       Groq (streaming rápido) + OpenAI (fallback)
Monorepo:  pnpm workspaces + Turborepo
```

---

## Ejecución local

```bash
# Instalar dependencias
pnpm install

# Iniciar frontend + backend en paralelo
pnpm dev
```

Requiere `.env` con:
```
GROQ_API_KEY=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## Roadmap

**v1.0**
- [ ] Proyectos estructurados
- [ ] Crystallize mejorado
- [ ] Exportación básica

**v1.1**
- [ ] Generación automática de PRDs
- [ ] Análisis competitivo por proyecto
- [ ] Roadmap automático

**v1.2**
- [ ] Seguimiento de milestones
- [ ] Dashboard estratégico

**v2.0**
- [ ] Sistema de ejecución con métricas
- [ ] Integraciones (GitHub, Notion, Linear)

---

**Objetivo a 12 meses:** Convertir WADI en el AI co-founder estándar para indie hackers que construyen SaaS.
