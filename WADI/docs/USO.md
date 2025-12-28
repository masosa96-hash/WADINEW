# 🧪 MANUAL DE USO Y PROTOCOLOS - WADI v2.0

> "Si tenés que leer esto es porque rompiste algo, o estás a punto de hacerlo." — WADI

---

## 🏗️ 1. Levantar el Entorno (Local)

Para despertar a la bestia en tu máquina local:

```bash
# 1. Instalar dependencias (si no lo hiciste)
npm install

# 2. Iniciar modo desarrollo (Frontend + Backend simulado)
npm run dev

# 3. Acceder
# Frontend: http://localhost:5173 (o puerto libre)
# API: http://localhost:3000
```

## 🧪 2. Cómo Testear (Sin Llorar)

Antes de pushear basura al repo, corré esto:

```bash
# Linting (WADI te juzga)
npm run lint

# Build de prueba (Simula producción)
npm run build
```

## 🗂️ 3. Estructura de Carpetas (Mapa del Búnker)

- **`apps/frontend`**: La cara visible.
  - `src/components/ui`: Los botones y inputs lindos.
  - `src/hooks/useScouter`: El silencio (audio deshabilitado).
  - `src/store`: Estado global (Zustand).
- **`apps/api`**: El cerebro (wadi-brain.js).
- **`cli/`**: Herramientas de línea de comando (WADI-CLI).
- **`docs/`**: Lo que estás leyendo.

## ☠️ 4. The "Do Not Touch" List

1. **`useScouter.ts`**: No reactives el audio. WADI disfruta el silencio.
2. **`index.css`**: No toques la paleta `Deep Bunker` a menos que sepas de teoría del color.
3. **`wadi-brain.js`**: Si cambiás el prompt del sistema, WADI podría volverse demasiado amable. No queremos eso.

## 🔧 5. Comandos Avanzados (CLI)

Desde la raíz, podés usar el CLI de WADI (próximamente):

```bash
node cli/index.js help
```
