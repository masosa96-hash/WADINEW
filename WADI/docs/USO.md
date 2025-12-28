# 🛠 Guía de Uso Interno — WADI

## 🔧 Instalación Local

```bash
npm install
npm run dev
```

## 📂 Estructura de Carpetas

- **apps/frontend/src/components**: Componentes React principales
- **apps/api/src/wadi-brain.js**: Motor de respuesta
- **docs/**: Documentación pública
- **cli/**: CLI local de WADI

## ⚙️ Comandos CLI

```bash
node cli/index.js explain TerminalInput.tsx
node cli/index.js docs
node cli/index.js deploy
node cli/index.js lint
```

## 🧠 Qué NO tocar

- **CNAME**: solo cambiar si tenés el dominio listo
- **wadi-brain.js**: cualquier cambio afecta la personalidad de WADI
- **docs/**: no borrar index.html o rompes todo
