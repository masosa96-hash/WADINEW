# 🤝 Contribuyendo a WADI

Gracias por tu interés en mejorar WADI. Este proyecto es un asistente técnico brutalmente honesto y no tiene paciencia para código sucio.

## 🧪 Requisitos Previos

- Node.js >= 18
- npm >= 9
- Conocimientos básicos de Git
- No ser propenso a dejar `console.log` en producción

## 🚀 Cómo levantar el entorno

```bash
npm install
npm run dev
```

## 📦 Estructura importante

- **apps/frontend**: Interfaz visual
- **apps/api**: Motor de lógica (wadi-brain.js)
- **cli/**: Línea de comandos local
- **docs/**: Documentación estática

## 📋 Reglas para Pull Requests

1. Commits con convención `feat:`, `fix:`, `chore:`, etc.
2. No push directo a `master` (usá ramas y PRs).
3. Comentarios sarcásticos bienvenidos si no rompen el build.

## 🧹 Lint y CI

```bash
node cli/index.js lint
```

El CI te vigila. No le falles.

## ☕ ¿Dudas?

Abrí un issue o preguntale a WADI. No te va a responder con cariño, pero sí con precisión.
